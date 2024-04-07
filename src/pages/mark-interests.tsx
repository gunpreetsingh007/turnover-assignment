import type { GetServerSideProps, NextApiRequest, NextApiResponse } from 'next';
import { useCallback, useEffect, useRef, useState } from 'react';
import { useRouter } from 'next/router';
import FormTitle from '~/components/FormTitle';
import InterestCheckbox from '~/components/InterestCheckbox';
import { api } from '~/utils/api';
import { debounce } from 'lodash';
import SkeletonInterestCheckbox from '~/components/SkeltonInterestCheckbox';
import { createCallerFactory, createTRPCContext } from '~/server/api/trpc';
import { appRouter } from '~/server/api/root';
import { verifyJwt } from '~/utils/jwt';
type MarkInterestsProps = {
  totalPaginationCount: number;
};

const createCaller = createCallerFactory(appRouter)

export default function MarkInterests({ totalPaginationCount }: MarkInterestsProps) {
  const router = useRouter();
  const editUserInterests = api.category.editUserInterests.useMutation();
  const currentPagination = Number(router.query.page) > totalPaginationCount ? 1 : Number(router.query.page) || 1
  const [selectedPagination, setSelectedPagination] = useState<number>(currentPagination);
  const getPaginatedCategories = api.category.getPaginatedCategories.useQuery({ page: selectedPagination });
  const categoriesWithInterest = getPaginatedCategories.data;
  const [paginationSetStartingNumber, setPaginationSetStartingNumber] = useState(Math.floor((currentPagination - 1) / 7) * 7 + 1);
  // Define the debounced function using useRef
  const updatePageUrl = useRef(
    debounce((page: number) => {
      router.push({ query: { ...router.query, page: page.toString() } }, undefined, { scroll: false, shallow: true }).catch(console.error);
    }, 100)
  ).current;

  // Trigger the URL update when selectedPagination changes
  useEffect(() => {
    updatePageUrl(selectedPagination);

    // Clean up the debounce handler on unmount or before the next effect runs
    return () => {
      updatePageUrl.cancel();
    };
  }, [selectedPagination, updatePageUrl]);

  useEffect(() => {
    // Function to update the pagination based on the query parameter
    const handleRouteChange = () => {
      const pageFromQuery = Number(router.query.page) || 1;
      // If the page from the query is greater than the total pagination count, reset the pagination
      if(pageFromQuery > totalPaginationCount) {
        setSelectedPagination(1);
        setPaginationSetStartingNumber(1);
        return;
      }
      // Calculate the new starting number based on the page from the query
      const newStartingNumber = Math.floor((pageFromQuery - 1) / 7) * 7 + 1;
      if (pageFromQuery !== selectedPagination) {
        setSelectedPagination(pageFromQuery);
      }
      if (newStartingNumber !== paginationSetStartingNumber) {
        setPaginationSetStartingNumber(newStartingNumber);
      }
    };

    // Subscribe to the router events
    router.events.on('routeChangeComplete', handleRouteChange);

    // Unsubscribe from the router events when the component unmounts
    return () => {
      router.events.off('routeChangeComplete', handleRouteChange);
    };
    // Disabling the exhaustive-deps rule here because adding selectedPagination and
    // paginationSetStartingNumber to the dependencies array would cause this effect
    // to run again after they're set, potentially creating an infinite loop.
    // The effect only needs to run when the router object updates.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [router]);

  const handleSingleArrowNextClick = useCallback(() => {
    if (selectedPagination === totalPaginationCount) return;
    if (selectedPagination % 7 === 0) {
      setPaginationSetStartingNumber(paginationSetStartingNumber + 7);
    }
    setSelectedPagination(selectedPagination + 1);
  }, [selectedPagination, totalPaginationCount, paginationSetStartingNumber]);

  const handleSingleArrowPrevClick = useCallback(() => {
    if (selectedPagination === 1) return;
    if ((selectedPagination - 1) % 7 === 0) {
      setPaginationSetStartingNumber(paginationSetStartingNumber - 7);
    }
    setSelectedPagination(selectedPagination - 1);
  }, [selectedPagination, paginationSetStartingNumber]);

  const handleDoubleArrowNextClick = useCallback(() => {
    setPaginationSetStartingNumber(totalPaginationCount - (totalPaginationCount % 7) + 1);
    setSelectedPagination(totalPaginationCount);
  }, [totalPaginationCount]);

  const handleDoubleArrowPrevClick = useCallback(() => {
    setPaginationSetStartingNumber(1);
    setSelectedPagination(1);
  }, []);

  const handlePageNumberClick = useCallback((pageNumber: number) => {
    setSelectedPagination(pageNumber);
  }, []);

  const handleCheckboxClick = useCallback((e: React.ChangeEvent<HTMLInputElement>, category: { isInterested: boolean, name: string, id: string }, index: number) => {
    try {
      editUserInterests.mutate({ categoryId: category.id, isInterested: e.target.checked });
      categoriesWithInterest![index]!.isInterested = e.target.checked;
    }
    catch (e) {
    }
  }, [editUserInterests, categoriesWithInterest]);

  return (
    <>
      <FormTitle title="Please mark your interests!" />
      <div className="flex items-center justify-center self-stretch text-center text-base font-normal leading-[26px] text-black mt-4" >
        <div className="flex items-center justify-end self-stretch" >
          <div className="flex justify-center">
            We will keep you notified.
          </div>
        </div>
      </div>
      <div className="flex items-end self-stretch pt-6 pb-5 text-left text-xl font-medium leading-[26px] text-black" >
        <div>My saved interests!</div>
      </div>
      {getPaginatedCategories.isLoading ? (
        <>
          {Array(7).fill(<SkeletonInterestCheckbox />)}
        </>
      ) : <>
        {categoriesWithInterest?.map((category, index) => (
          <>
            <InterestCheckbox key={category.id} isChecked={category.isInterested} handleClick={(e) => handleCheckboxClick(e, category, index)}>{category.name}</InterestCheckbox>
          </>
        ))}
      </>}
      <div className="flex items-end self-stretch pt-[40px] pb-[25px] text-left text-xl font-medium leading-[26px]" >
        <div>
          <button onClick={handleDoubleArrowPrevClick} className="text-neutral-400" >
            {"<<"}
          </button>
          <button onClick={handleSingleArrowPrevClick} className='text-neutral-400 pl-3'>
            {"<"}
          </button>
          {Array.from({ length: (paginationSetStartingNumber + 7 > totalPaginationCount) ? (totalPaginationCount - paginationSetStartingNumber + 1) : 7 }, (_, index) => index + paginationSetStartingNumber).map((pageNumber) => (
            <button
              key={pageNumber}
              className={`pl-3 ${selectedPagination === pageNumber ? 'text-black' : 'text-neutral-400'}`}
              onClick={() => handlePageNumberClick(pageNumber)}
            >
              {pageNumber}
            </button>
          ))}
          <button className='text-neutral-400 pl-3' style={{ display: (totalPaginationCount) > paginationSetStartingNumber + 6 ? 'inline' : 'none' }}>
            {"..."}
          </button>
          <button onClick={handleSingleArrowNextClick} className="text-neutral-400 pl-3">
            {">"}
          </button>
          <button onClick={handleDoubleArrowNextClick} className='text-neutral-400 pl-3'>
            {">>"}
          </button>
        </div>
      </div>
    </>
  );
};

export const getServerSideProps: GetServerSideProps = async (ctx) => {
  const { req, res } = ctx;
  const token = req.cookies.token;

  if (!token) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    };
  }

  try {
    verifyJwt(token);
  } catch (error) {
    return {
      redirect: {
        destination: '/',
        permanent: false
      }
    };
  }
  const caller = createCaller(createTRPCContext({
    req: req as NextApiRequest, res: res as NextApiResponse, info: {
      isBatchCall: false,
      calls: []
    }
  }));
  const totalPaginationCount = await caller.category.getTotalPaginatedCountForCategories();
  return {
    props: {
      totalPaginationCount
    }
  };
};