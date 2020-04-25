import express from "express";
import { HTTPStatusCodes } from "../../types/http-status-codes";
import { IRestError } from "../../types/RESTError";

export interface IResponse {
  readonly apply: (res: express.Response) => void;
}

export const ResponseSuccessJSON = <T>(
  status: HTTPStatusCodes,
  payload: T
): IResponse => {
  return {
    apply: (res) => res.status(status).json(payload),
  };
};

export const ResponseError = (
  status: HTTPStatusCodes,
  error: IRestError
): IResponse => {
  return {
    apply: (res) => res.status(status).json({ error }),
  };
};
