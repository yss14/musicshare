import { InMemoryCache } from "apollo-cache-inmemory";

export interface ILoginVariables {
  shareID: string;
}

export const updateShareId = (
  _: any,
  { shareID }: ILoginVariables,
  { cache }: { cache: InMemoryCache }
) => {
  cache.writeData({ data: { shareID } });
};
