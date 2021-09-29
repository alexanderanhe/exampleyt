import { Fragment, useState, useEffect, useRef } from 'react';
import useLocalStorage from './hooks/localStorage';
import linuxBasic, { linuxBasicKeyDown } from './Functions';
import './App.scss';
import { useAppContext } from './context/AppContext';
import getASCII from './source';

const Loader = ({ message }) => (
  <div className="loader">
    <div className="loader__spinner" />
    <p className="loader__text">{message}</p>
  </div>
);

const DEFAULT_USER_TREE = {
  aboutMe: ["Hola"]
};

function App() {
  const [{ theme, lang, isLoading }, dispatch] = useAppContext();
  const inputBox = useRef(null);
  const input = useRef(null);
  const [prefix, setPrefix ] = useState("");
  const [consoleScreen, setConsoleScreen] = useState([]);
  const [tools, setTools] = useState({
    cursor: 0,
    code: "",
    focus: true
  });
  const [history, setHistory] = useLocalStorage('history', []);
  const [userTree, setUserTree] = useState(DEFAULT_USER_TREE);
  const html = document.querySelector("html");

  const logic = ({code}) => {
    setConsoleScreen([ ...consoleScreen, { prefix, command: code, error: true, response: [`Command "${code}" not found`] }]);
  }

  const handleSubmit = (e) => {
    e.preventDefault();
    const { code } = tools;
    if (!code) return;
    const output = linuxBasic({
      code, history, prefix, userTree, user: {}
    });
    if (output) {
      if (setPrefix) {
        setPrefix(output?.payload?._prefix || prefix);
      }
      if (output.type === "CLEARCONSOLESCREEN") {
        setConsoleScreen([]);
      } else if (output.type === "CHANGE_THEME") {
        dispatch(output)
      } else {
        setConsoleScreen([ ...consoleScreen, output.payload ]);
      }
    } else {
      logic({ code });
    }
    setHistory([...history, code]);
    setTools({
      ...tools,
      code: "",
      cursor: 0
    });
  };
  const handleChange = (event) => {
    setTools({
      ...tools,
      code: (history[history.length - tools.cursor] || "") + event.target.value,
      cursor: 0
    });
  };

  const handleFocus = () => {
    if (input.current) {
      inputBox.current.scrollTo({
        top: inputBox.current.firstElementChild.clientHeight,
        left: 0,
        behavior: 'smooth'
      });
      input.current.focus();
    }
  };

  const handleKeyDown = (event) => {
    const { code, cursor } = tools;
    const output = linuxBasicKeyDown({
      event, code, cursor, history, prefix, userTree
    });
    setTools({ ...tools, ...output });
  }

  useEffect(() => {
    if (input.current) {
      setTools({ ...tools, focus: true });
      input.current.focus();
    }
    dispatch({type: "LOADER", payload: false});
    setConsoleScreen([ ...consoleScreen, { response: getASCII("hacking") } ]);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  useEffect(() => {
    if (!tools.code) {
      handleFocus();
    }
  }, [tools.code, consoleScreen, theme]);

  useEffect(() => {
    html.dataset.theme = `${theme}`;
    html.lang = lang;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [theme, lang]);

  if (isLoading) {
    return <Loader message={isLoading} />
  }

  return (
    <div className="terminal" onClick={handleFocus} ref={inputBox}>
      <form onSubmit={handleSubmit}>
        {consoleScreen?.map((cmd, j) => (
          <Fragment key={`${cmd}-${j}`}>
            {cmd.command && (
              <p className="prompt" data-prefix={`${cmd.prefix || ""}> `} style={cmd.style}>{cmd.command}</p>
            )}
            <ul className={`${cmd.error ? "error" : ""} ${cmd.block ? "block" : ""}`}>
              {cmd.response && cmd.response?.map((line, i) => (
                <li key={`${line}-${i}`} style={cmd.style} className="result">{line}</li>
              ))}
            </ul>
          </Fragment>
        ))}
        <p className={"prompt output new-output" + (tools.focus ? " active" : "")}  data-prefix={`${prefix || ""}> `}>
          <input
            type="text"
            className="invisible"
            ref={input}
            onChange={handleChange}
            onKeyDown={handleKeyDown}
            onBlur={() => setTools({ ...tools, focus: false })}
            onFocus={() => setTools({ ...tools, focus: true })}
            value={tools.code}
          />
          <span>{history[history.length - tools.cursor] || ""}</span>
          {tools.code}
        </p>
      </form>
    </div>
  );
}

export default App;
