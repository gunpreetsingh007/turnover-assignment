import jwt from "jsonwebtoken";

export const signAuthJwt = (user: {id: string, email: string, name: string}) => {
    return jwt.sign({ id: user.id, email: user.email, name: user.name, type: 'auth' }, process.env.JWT_SECRET ?? '', {
        expiresIn: "1d",
    })
}

export const signVerifyEmailJwt = (user: {id: string, email: string, name: string}) => {
    return jwt.sign({ id: user.id, email: user.email, name: user.name, type: 'verifyEmail' }, process.env.JWT_SECRET ?? '', {
        expiresIn: "1d",
    })
}

export const verifyJwt = (token: string) => {
    return jwt.verify(token, process.env.JWT_SECRET ?? '')
}


// Define the expected structure of JWT payload
export type DecodedJwtPayload = {
    id: string;
    email: string;
    name: string;
    type: 'auth' | 'verifyEmail';
};