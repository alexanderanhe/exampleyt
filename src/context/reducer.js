import { PREFIX } from "../hooks/localStorage";

export default function Reducer(state, action) {
  switch (action.type) {
    case "CHANGE_THEME":
      const themeValidation = state.theme === "clasic" ? "monitor" : "clasic";
        localStorage.setItem(`${PREFIX}theme`, JSON.stringify(themeValidation));
        return {
          ...state,
          theme: themeValidation
        };
    case "CHANGE_LANGUAGE":
      const langValidation = state.lang === "en" ? "es" : "en";
      localStorage.setItem(`${PREFIX}lang`, JSON.stringify(langValidation));
      return {
        ...state,
        lang: langValidation
      };
    case "LOADER":
      return {
        ...state,
        isLoading: action.payload
      };
    default:
      return state;
  }
}
