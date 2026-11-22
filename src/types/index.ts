import type { Request } from "express";
export interface Userdata {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
    role: string;
}

export interface RegisterRequest extends Request {
    body: Userdata;
}

export interface AuthRequest extends Request {
    auth: {
        sub: string;
        role: string;
    };
}
