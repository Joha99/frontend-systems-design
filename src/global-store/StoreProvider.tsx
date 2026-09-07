import {
  createContext,
  useContext,
  useReducer,
  type ActionDispatch,
  type PropsWithChildren,
} from "react";

type Action =
  | { type: "TOGGLE_THEME" }
  | { type: "LOGIN" }
  | { type: "LOGOUT" }
  | { type: "ADD_NOTIFICATION"; id: Notification["id"]; timestamp: Notification["timestamp"] }
  | { type: "REMOVE_NOTIFICATION"; id: Notification["id"] };

export type Theme = "light" | "dark";

export type User = {
  name: string;
  loggedIn: boolean;
};

export type Notification = {
  id: number;
  message: string;
  timestamp: Date;
};

export type StoreState = {
  theme: Theme;
  user: User;
  notifications: Notification[];
};

type Dispatch = ActionDispatch<[action: Action]>;

const defaultStoreValues: StoreState = {
  theme: "light",
  user: {
    name: "Joha Kim",
    loggedIn: false,
  },
  notifications: Array.from({ length: 20 }, (_, i) => ({
    id: i,
    message: `Notification #${i}`,
    timestamp: new Date(),
  })),
};

const StoreContext = createContext<StoreState>(defaultStoreValues);
const DispatchContext = createContext<Dispatch>(() => {});

export const useStoreContext = () => useContext(StoreContext);
export const useStoreSetterContext = () => useContext(DispatchContext);

const appReducer = (prevState: StoreState, action: Action): StoreState => {
  switch (action.type) {
    case "TOGGLE_THEME":
      return { ...prevState, theme: prevState.theme === "light" ? "dark" : "light" };
    case "LOGIN":
      return { ...prevState, user: { ...prevState.user, loggedIn: true } };
    case "LOGOUT":
      return { ...prevState, user: { ...prevState.user, loggedIn: false } };
    case "ADD_NOTIFICATION":
      return {
        ...prevState,
        notifications: [
          ...prevState.notifications,
          { id: action.id, message: `New notification #${action.id}`, timestamp: action.timestamp },
        ],
      };
    case "REMOVE_NOTIFICATION":
      return {
        ...prevState,
        notifications: prevState.notifications.filter((n) => n.id !== action.id),
      };
  }
};

export const StoreProvider = ({ children }: PropsWithChildren) => {
  const [appStore, dispatch] = useReducer(appReducer, defaultStoreValues);

  return (
    <StoreContext.Provider value={appStore}>
      <DispatchContext.Provider value={dispatch}>
        {children}
      </DispatchContext.Provider>
    </StoreContext.Provider>
  );
};
