export interface ITodoVariables {
  id: string;
}

export interface IEmailVariables {
  id: string;
  email: string;
}

export interface IVisibilityVariables {
  visibilityFilter: string;
}

export interface IShareVariables {
  shareId: string;
}

export interface IShareData {
  shareId: string;
}

export interface IUserData {
  user: {
    shares: {
      id: string;
      name: string;
      userID: string;
    }[];
    id: string;
    name: string;
    emails: string[];
  };
}

export interface IUserVariables {
  id: string;
}
