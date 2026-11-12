import type { Request } from "express";
export interface Userdata {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
}

export interface RegisterRequest extends Request {
    body: Userdata;
}
