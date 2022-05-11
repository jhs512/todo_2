function _extends() {_extends = Object.assign || function (target) {for (var i = 1; i < arguments.length; i++) {var source = arguments[i];for (var key in source) {if (Object.prototype.hasOwnProperty.call(source, key)) {target[key] = source[key];}}}return target;};return _extends.apply(this, arguments);}console.clear();

// # 임포트 시작
const { useState, useRef, useEffect, useMemo } = React;

import classNames from "https://cdn.skypack.dev/classnames";

import { produce } from "https://cdn.skypack.dev/immer";

const {
  RecoilRoot,
  atom,
  atomFamily,
  useRecoilState,
  useSetRecoilState,
  useRecoilValue } =
Recoil;

import { recoilPersist } from "https://cdn.skypack.dev/recoil-persist";

const {
  HashRouter: Router,
  Routes,
  Route,
  NavLink,
  Navigate,
  useParams,
  useNavigate,
  useLocation } =
ReactRouterDOM;

const {
  colors,
  CssBaseline,
  ThemeProvider,
  createTheme,
  Link,
  Button,
  AppBar,
  Toolbar,
  TextField,
  Chip,
  Box,
  SwipeableDrawer,
  List,
  ListItem,
  Divider,
  Modal,
  Snackbar,
  Alert: MuiAlert,
  Tabs,
  Tab } =
MaterialUI;
// # 임포트 끝

// # 유틸리티 시작

// 날짜 객체 입력받아서 문장(yyyy-mm-dd hh:mm:ss)으로 반환한다.
function dateToStr(d) {
  const pad = n => {
    return n < 10 ? "0" + n : n;
  };

  return (
    d.getFullYear() +
    "-" +
    pad(d.getMonth() + 1) +
    "-" +
    pad(d.getDate()) +
    " " +
    pad(d.getHours()) +
    ":" +
    pad(d.getMinutes()) +
    ":" +
    pad(d.getSeconds()));

}

// # 유틸리티 끝

// # 리코일 퍼시스트 저장소 시작
const { persistAtom: persistAtomCommon } = recoilPersist({
  key: "persistAtomCommon" });


const { persistAtom: persistAtomTodos } = recoilPersist({
  key: "persistAtomTodos" });


const { persistAtom: persistAtomLastTodoId } = recoilPersist({
  key: "persistAtomLastTodoId" });


// # 리코일 퍼시스트 저장소 끝

// # 유틸리티 컴포넌트 시작
// ## 커스텀 스낵바 시작
const noticeSnackbarInfoAtom = atom({
  key: "app/noticeSnackbarInfoAtom",
  default: {
    opened: false,
    autoHideDuration: 0,
    severity: "",
    msg: "" } });



function useNoticeSnackbarStatus() {
  const [noticeSnackbarInfo, setNoticeSnackbarInfo] = useRecoilState(
  noticeSnackbarInfoAtom);


  const opened = noticeSnackbarInfo.opened;
  const autoHideDuration = noticeSnackbarInfo.autoHideDuration;
  const severity = noticeSnackbarInfo.severity;
  const msg = noticeSnackbarInfo.msg;

  const open = (msg, severity = "success", autoHideDuration = 6000) => {
    setNoticeSnackbarInfo({
      opened: true,
      msg,
      severity,
      autoHideDuration });

  };

  const close = () => {
    setNoticeSnackbarInfo({
      ...noticeSnackbarInfo,
      opened: false });

  };

  return {
    opened,
    open,
    close,
    autoHideDuration,
    severity,
    msg };

}

const Alert = React.forwardRef((props, ref) => {
  return /*#__PURE__*/React.createElement(MuiAlert, _extends({}, props, { ref: ref, variant: "filled" }));
});

function NoticeSnackbar() {
  const status = useNoticeSnackbarStatus();

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(Snackbar, {
      open: status.opened,
      autoHideDuration: status.autoHideDuration,
      onClose: status.close }, /*#__PURE__*/

    React.createElement(Alert, { severity: status.severity }, status.msg))));



}
// ## 커스텀 스낵바 끝

// # 유틸리티 컴포넌트 끝

// # 비지니스 로직 시작

// ## todosStatus 시작
const todosAtom = atom({
  key: "app/todosAtom",
  default: [],
  effects_UNSTABLE: [persistAtomTodos] });


const lastTodoIdAtom = atom({
  key: "app/lastTodoIdAtom",
  default: 0,
  effects_UNSTABLE: [persistAtomLastTodoId] });


function useTodosStatus() {
  const [todos, setTodos] = useRecoilState(todosAtom);
  const [lastTodoId, setLastTodoId] = useRecoilState(lastTodoIdAtom);
  const lastTodoIdRef = useRef(lastTodoId);

  lastTodoIdRef.current = lastTodoId;

  const addTodo = (performDate, newContent) => {
    const id = ++lastTodoIdRef.current;
    setLastTodoId(id);

    const newTodo = {
      id,
      regDate: dateToStr(new Date()),
      performDate: dateToStr(new Date(performDate)),
      content: newContent,
      completed: false };


    setTodos(todos => [newTodo, ...todos]);

    return id;
  };

  const modifyTodo = (index, performDate, content) => {
    const newTodos = produce(todos, draft => {
      draft[index].performDate = dateToStr(new Date(performDate));
      draft[index].content = content;
    });
    setTodos(newTodos);
  };

  const modifyTodoById = (id, performDate, newContent) => {
    const index = findTodoIndexById(id);

    if (index == -1) {
      return;
    }

    modifyTodo(index, performDate, newContent);
  };

  const removeTodo = index => {
    const newTodos = todos.filter((_, _index) => _index != index);
    setTodos(newTodos);
  };

  const toggleTodoCompletedById = id => {
    const index = findTodoIndexById(id);

    if (index == -1) {
      return;
    }

    setTodos(
    produce(todos, draft => {
      draft[index].completed = !draft[index].completed;
    }));

  };

  const removeTodoById = id => {
    const index = findTodoIndexById(id);

    if (index != -1) {
      removeTodo(index);
    }
  };

  const findTodoIndexById = id => {
    return todos.findIndex(todo => todo.id == id);
  };

  const findTodoById = id => {
    const index = findTodoIndexById(id);

    if (index == -1) {
      return null;
    }

    return todos[index];
  };

  return {
    todos,
    addTodo,
    modifyTodo,
    modifyTodoById,
    toggleTodoCompletedById,
    removeTodo,
    removeTodoById,
    findTodoById };

}
// ## todosStatus 끝

// # 비지니스 로직 끝

// # 공통 컴포넌트 시작

// # 공통 컴포넌트 끝

// # 페이지들 시작

// ## 메인 페이지관련 컴포넌트 시작
function TodosEmpty() {
  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("div", { className: "flex-1 flex justify-center items-center" }, /*#__PURE__*/
    React.createElement("div", { className: "grid gap-2" }, /*#__PURE__*/
    React.createElement("span", null, /*#__PURE__*/
    React.createElement("span", { className: "text-[color:var(--mui-color-primary-main)]" }, "\uD560\uC77C"), "\uC744 \uC785\uB825\uD574\uC8FC\uC138\uC694."), /*#__PURE__*/




    React.createElement(Button, {
      size: "large",
      variant: "contained",
      component: NavLink,
      to: "/write" }, "\uD560\uC77C \uCD94\uAC00\uD558\uAE30")))));







}

const TodoList__filterCompletedIndexAtom = atom({
  key: "app/TodoList__filterCompletedIndexAtom",
  default: 0,
  effects_UNSTABLE: [persistAtomCommon] });


const TodoList__sortIndexAtom = atom({
  key: "app/TodoList__sortIndexAtom",
  default: 0,
  effects_UNSTABLE: [persistAtomCommon] });


function TodoList() {
  const todosStatus = useTodosStatus();
  const todoOptionDrawerStatus = useTodoOptionDrawerStatus();
  const onCompletedBtnClicked = id => todosStatus.toggleTodoCompletedById(id);

  const [filterCompletedIndex, setFilterCompletedIndex] = useRecoilState(
  TodoList__filterCompletedIndexAtom);


  const [sortIndex, setSortIndex] = useRecoilState(TodoList__sortIndexAtom);

  const getFilteredTodos = () => {
    if (filterCompletedIndex == 1)
    return todosStatus.todos.filter(todo => !todo.completed);

    if (filterCompletedIndex == 2)
    return todosStatus.todos.filter(todo => todo.completed);

    return todosStatus.todos;
  };

  const filteredTodos = getFilteredTodos();

  const getSortedTodos = () => {
    if (sortIndex == 0) {
      return [...filteredTodos].sort((a, b) => {
        if (a.performDate == b.performDate) return 0;

        return a.performDate > b.performDate ? 1 : -1;
      });
    } else if (sortIndex == 1) {
      return [...filteredTodos].sort((a, b) => {
        if (a.performDate == b.performDate) return 0;

        return a.performDate < b.performDate ? 1 : -1;
      });
    } else if (sortIndex == 2) {
      return [...filteredTodos].sort((a, b) => {
        return a.id > b.id ? 1 : -1;
      });
    }

    return filteredTodos;
  };

  const sortedTodos = getSortedTodos();

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(TodoOptionDrawer, { status: todoOptionDrawerStatus }), /*#__PURE__*/

    React.createElement(Tabs, {
      variant: "fullWidth",
      value: filterCompletedIndex,
      onChange: (event, newValue) => setFilterCompletedIndex(newValue) }, /*#__PURE__*/

    React.createElement(Tab, {
      label: /*#__PURE__*/
      React.createElement("span", { className: "flex" }, /*#__PURE__*/
      React.createElement("i", { className: "fa-solid fa-list-ul" }), /*#__PURE__*/
      React.createElement("span", { className: "ml-2" }, "\uC804\uCCB4")),


      value: 0 }), /*#__PURE__*/

    React.createElement(Tab, {
      label: /*#__PURE__*/
      React.createElement("span", { className: "flex" }, /*#__PURE__*/
      React.createElement("i", { className: "fa-regular fa-square" }), /*#__PURE__*/
      React.createElement("span", { className: "ml-2" }, "\uBBF8\uC644\uB8CC")),


      value: 1 }), /*#__PURE__*/

    React.createElement(Tab, {
      label: /*#__PURE__*/
      React.createElement("span", { className: "flex" }, /*#__PURE__*/
      React.createElement("i", { className: "fa-regular fa-square-check" }), /*#__PURE__*/
      React.createElement("span", { className: "ml-2" }, "\uC644\uB8CC")),


      value: 2 })), /*#__PURE__*/



    React.createElement(Tabs, {
      variant: "scrollable",
      value: sortIndex,
      onChange: (event, newValue) => {
        setSortIndex(newValue);
      } }, /*#__PURE__*/

    React.createElement(Tab, {
      className: "flex-grow !max-w-[none] px-4",
      label: /*#__PURE__*/
      React.createElement("span", { className: "flex items-baseline" }, /*#__PURE__*/
      React.createElement("i", { className: "fa-regular fa-clock mr-2" }), /*#__PURE__*/
      React.createElement("span", { className: "mr-2 whitespace-nowrap" }, "\uAE09\uD574\uC694"), /*#__PURE__*/
      React.createElement("i", { className: "fa-solid fa-sort-up relative top-[3px]" })),


      value: 0 }), /*#__PURE__*/

    React.createElement(Tab, {
      className: "flex-grow !max-w-[none] px-4",
      label: /*#__PURE__*/
      React.createElement("span", { className: "flex items-baseline" }, /*#__PURE__*/
      React.createElement("i", { className: "fa-regular fa-clock mr-2" }), /*#__PURE__*/
      React.createElement("span", { className: "mr-2 whitespace-nowrap" }, "\uB110\uB7F4\uD574\uC694"), /*#__PURE__*/
      React.createElement("i", { className: "fa-solid fa-sort-down relative top-[-3px]" })),


      value: 1 }), /*#__PURE__*/

    React.createElement(Tab, {
      className: "flex-grow !max-w-[none] px-4",
      label: /*#__PURE__*/
      React.createElement("span", { className: "flex items-baseline" }, /*#__PURE__*/
      React.createElement("i", { className: "fa-solid fa-pen mr-2" }), /*#__PURE__*/
      React.createElement("span", { className: "mr-2 whitespace-nowrap" }, "\uC791\uC131\uC21C"), /*#__PURE__*/
      React.createElement("i", { className: "fa-solid fa-sort-up relative top-[3px]" })),


      value: 2 }), /*#__PURE__*/

    React.createElement(Tab, {
      className: "flex-grow !max-w-[none] px-4",
      label: /*#__PURE__*/
      React.createElement("span", { className: "flex items-baseline" }, /*#__PURE__*/
      React.createElement("i", { className: "fa-solid fa-pen mr-2" }), /*#__PURE__*/
      React.createElement("span", { className: "mr-2 whitespace-nowrap" }, "\uC791\uC131\uC21C"), /*#__PURE__*/
      React.createElement("i", { className: "fa-solid fa-sort-down relative top-[-3px]" })),


      value: 3 })), /*#__PURE__*/



    React.createElement("div", { className: "px-6 sm:px-8 pb-6 sm:pb-8" }, /*#__PURE__*/
    React.createElement("ul", null,
    sortedTodos.map((todo, index) => /*#__PURE__*/
    React.createElement(TodoListItem, {
      key: todo.id,
      todo: todo,
      index: index,
      onCompletedBtnClicked: onCompletedBtnClicked,
      openDrawer: todoOptionDrawerStatus.open }))))));






}

function TodoListItem({ onCompletedBtnClicked, todo, index, openDrawer }) {
  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("li", { key: todo.id, className: "mt-6 sm:mt-8" }, /*#__PURE__*/
    React.createElement("div", { className: "flex gap-2" }, /*#__PURE__*/
    React.createElement(Chip, {
      label: `번호 : ${todo.id}`,
      variant: "outlined",
      className: "!pt-1" }), /*#__PURE__*/

    React.createElement(Chip, {
      label: todo.performDate.substr(2, 14),
      color: "primary",
      variant: "outlined",
      className: "!pt-1" })), /*#__PURE__*/


    React.createElement("div", { className: "mt-2 sm:mt-4 shadow rounded-[20px] flex" }, /*#__PURE__*/
    React.createElement(Button, {
      className: "flex-shrink-0 !items-start !rounded-[20px_0_0_20px]",
      color: "inherit",
      onClick: () => onCompletedBtnClicked(todo.id) }, /*#__PURE__*/

    React.createElement("span", {
      className: classNames(
      "text-4xl",
      "h-[80px]",
      "flex items-center",
      {
        "text-[color:var(--mui-color-primary-main)]": todo.completed },

      { "text-[#dcdcdc]": !todo.completed }) }, /*#__PURE__*/


    React.createElement("i", { className: "fa-solid fa-check" }))), /*#__PURE__*/


    React.createElement("div", { className: "flex-shrink-0 my-5 w-[2px] bg-[#dcdcdc] mr-4" }), /*#__PURE__*/
    React.createElement("div", { className: "whitespace-pre-wrap leading-relaxed hover:text-[color:var(--mui-color-primary-main)] flex-grow flex items-center my-5" },
    todo.content), /*#__PURE__*/

    React.createElement(Button, {
      onClick: () => openDrawer(todo.id),
      className: "flex-shrink-0 !items-start !rounded-[0_20px_20px_0]",
      color: "inherit" }, /*#__PURE__*/

    React.createElement("span", { className: "text-[#dcdcdc] text-2xl h-[80px] flex items-center" }, /*#__PURE__*/
    React.createElement("i", { className: "fa-solid fa-ellipsis-vertical" })))))));






}

function useTodoOptionDrawerStatus() {
  const [todoId, setTodoId] = useState(null);
  const opened = useMemo(() => todoId !== null, [todoId]);
  const close = () => setTodoId(null);
  const open = id => setTodoId(id);

  return {
    todoId,
    opened,
    close,
    open };

}

function TodoOptionDrawer({ status }) {
  const noticeSnackbarStatus = useNoticeSnackbarStatus();
  const todosStatus = useTodosStatus();

  const removeTodo = () => {
    if (confirm(`${status.todoId}번 할일을 삭제하시겠습니까?`) == false) {
      status.close();
      return;
    }

    todosStatus.removeTodoById(status.todoId);
    status.close();
    noticeSnackbarStatus.open(
    `${status.todoId}번 할일이 삭제되었습니다.`,
    "info");

  };

  const todo = todosStatus.findTodoById(status.todoId);

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(SwipeableDrawer, {
      anchor: "bottom",
      onOpen: () => {},
      open: status.opened,
      onClose: status.close }, /*#__PURE__*/

    React.createElement(List, { className: "!py-0" }, /*#__PURE__*/
    React.createElement(ListItem, { className: "!pt-6 !p-5" }, /*#__PURE__*/
    React.createElement("span", { className: "text-[color:var(--mui-color-primary-main)]" },
    todo === null || todo === void 0 ? void 0 : todo.id, "\uBC88"), /*#__PURE__*/

    React.createElement("span", null, "\xA0"), /*#__PURE__*/
    React.createElement("span", null, "\uD560\uC77C\uC5D0 \uB300\uD574\uC11C")), /*#__PURE__*/

    React.createElement(Divider, null), /*#__PURE__*/
    React.createElement(ListItem, {
      className: "!pt-6 !p-5 !items-baseline",
      button: true,
      onClick: removeTodo }, /*#__PURE__*/

    React.createElement("i", { className: "fa-solid fa-trash-can" }), "\xA0", /*#__PURE__*/

    React.createElement("span", null, "\uC0AD\uC81C")), /*#__PURE__*/

    React.createElement(ListItem, {
      className: "!pt-6 !p-5 !items-baseline",
      button: true,
      component: NavLink,
      to: `/edit/${todo === null || todo === void 0 ? void 0 : todo.id}` }, /*#__PURE__*/

    React.createElement("i", { className: "fa-solid fa-pen-to-square" }), "\xA0", /*#__PURE__*/

    React.createElement("span", null, "\uC218\uC815"))))));





}
// ## 메인 페이지관련 컴포넌트 끝

// ## 메인 페이지 시작
function MainPage() {
  const todosStatus = useTodosStatus();

  const todosEmpty = todosStatus.todos.length == 0;

  if (todosEmpty) {
    return /*#__PURE__*/React.createElement(TodosEmpty, null);
  }

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(TodoList, null)));


}
// ## 메인 페이지 끝

// ## 글쓰기 페이지관련 컴포넌트 시작

// ## 글쓰기 페이지관련 컴포넌트 끝

// ## 글쓰기 페이지 시작
function WritePage() {
  const noticeSnackbarStatus = useNoticeSnackbarStatus();
  const todosStatus = useTodosStatus();

  const onSubmit = e => {
    e.preventDefault();
    const form = e.target;

    if (form.performDate.value.length == 0) {
      alert("언제 해야하는지 알려주세요.");
      form.performDate.focus();

      return;
    }

    if (form.content.value.length == 0) {
      alert("무엇을 해야하는지 알려주세요.");
      form.content.focus();

      return;
    }

    const newTodoId = todosStatus.addTodo(
    form.performDate.value,
    form.content.value);


    noticeSnackbarStatus.open(`${newTodoId}번 할일이 등록되었습니다.`);

    form.content.value = "";
    form.content.focus();
  };

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("form", {
      className: "flex-1 flex flex-col gap-6 p-6 sm:p-8",
      onSubmit: onSubmit }, /*#__PURE__*/

    React.createElement(TextField, {
      name: "performDate",
      label: "\uC5B8\uC81C \uD574\uC57C \uB418\uB098\uC694?",
      focused: true,
      type: "datetime-local" }), /*#__PURE__*/

    React.createElement(TextField, {
      name: "content",
      className: "flex-1 flex",
      InputProps: { className: "flex-1 flex-col" },
      inputProps: { className: "flex-1" },
      label: "\uBB34\uC5C7\uC744 \uD574\uC57C \uD558\uB098\uC694?",
      multiline: true }), /*#__PURE__*/

    React.createElement(Button, { type: "submit", variant: "contained" }, /*#__PURE__*/
    React.createElement("i", { className: "fa-solid fa-marker" }), /*#__PURE__*/
    React.createElement("span", null, "\xA0"), /*#__PURE__*/
    React.createElement("span", null, "\uD560\uC77C\uCD94\uAC00")))));




}
// ## 글쓰기 페이지 끝

// ## 글수정 페이지관련 컴포넌트 시작

// ## 글수정 페이지관련 컴포넌트 끝

// ## 글수정 페이지 시작
function EditPage() {
  const navigate = useNavigate();
  const { id } = useParams();

  const noticeSnackbarStatus = useNoticeSnackbarStatus();
  const todosStatus = useTodosStatus();

  const todo = todosStatus.findTodoById(id);

  const onSubmit = e => {
    e.preventDefault();
    const form = e.target;

    if (form.performDate.value.length == 0) {
      alert("언제 해야하는지 알려주세요.");
      form.performDate.focus();

      return;
    }

    if (form.content.value.length == 0) {
      alert("무엇을 해야하는지 알려주세요.");
      form.content.focus();

      return;
    }

    const newTodoId = todosStatus.modifyTodoById(
    todo.id,
    form.performDate.value,
    form.content.value);


    noticeSnackbarStatus.open(`${todo.id}번 할일이 수정되었습니다.`, "info");

    navigate(-1);
  };

  const performDateForInput = todo.performDate.substr(0, 16).replace(" ", "T");

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement("form", {
      className: "flex-1 flex flex-col gap-6 p-6 sm:p-8",
      onSubmit: onSubmit }, /*#__PURE__*/

    React.createElement(TextField, {
      name: "performDate",
      label: "\uC5B8\uC81C \uD574\uC57C \uB418\uB098\uC694?",
      focused: true,
      type: "datetime-local",
      defaultValue: performDateForInput }), /*#__PURE__*/

    React.createElement(TextField, {
      name: "content",
      className: "flex-1 flex",
      InputProps: { className: "flex-1 flex-col" },
      inputProps: { className: "flex-1" },
      label: "\uBB34\uC5C7\uC744 \uD574\uC57C \uD558\uB098\uC694?",
      multiline: true,
      defaultValue: todo.content }), /*#__PURE__*/

    React.createElement(Button, { type: "submit", variant: "contained" }, /*#__PURE__*/
    React.createElement("i", { className: "fa-solid fa-marker" }), /*#__PURE__*/
    React.createElement("span", null, "\xA0"), /*#__PURE__*/
    React.createElement("span", null, todo.id, "\uBC88 \uD560\uC77C\uC218\uC815")))));




}
// ## 글수정 페이지 끝

// # 페이지들 끝

// # 앱 세팅 시작
function App() {
  const navigate = useNavigate();
  const location = useLocation();

  return /*#__PURE__*/(
    React.createElement(React.Fragment, null, /*#__PURE__*/
    React.createElement(AppBar, { position: "fixed" }, /*#__PURE__*/
    React.createElement(Toolbar, null, /*#__PURE__*/
    React.createElement(NavLink, {
      to: "/main",
      className: "font-bold select-none self-stretch flex items-center mr-auto" }, "HAPPY NOTE"),




    location.pathname == "/main" && /*#__PURE__*/
    React.createElement(NavLink, {
      className: "select-none self-stretch flex items-center",
      to: "/write" }, "\uD560\uC77C\uCD94\uAC00"),




    location.pathname != "/main" && /*#__PURE__*/
    React.createElement("span", {
      className: "select-none cursor-pointer self-stretch flex items-center",
      onClick: () => navigate(-1) }, "\uB2E4\uC74C\uC5D0 \uD560\uB798\uC694."))), /*#__PURE__*/






    React.createElement(Toolbar, null), /*#__PURE__*/
    React.createElement(NoticeSnackbar, null), /*#__PURE__*/
    React.createElement(Routes, null, /*#__PURE__*/
    React.createElement(Route, { path: "/main", element: /*#__PURE__*/React.createElement(MainPage, null) }), /*#__PURE__*/
    React.createElement(Route, { path: "/write", element: /*#__PURE__*/React.createElement(WritePage, null) }), /*#__PURE__*/
    React.createElement(Route, { path: "/edit/:id", element: /*#__PURE__*/React.createElement(EditPage, null) }), /*#__PURE__*/
    React.createElement(Route, { path: "*", element: /*#__PURE__*/React.createElement(Navigate, { to: "/main" }) }))));



}

const muiThemePaletteKeys = [
"background",
"common",
"error",
"grey",
"info",
"primary",
"secondary",
"success",
"text",
"warning"];


function Root() {
  // Create a theme instance.
  const theme = createTheme({
    typography: {
      fontFamily: ["GmarketSansMedium"] },

    // 앱 테마
    palette: {} });




  useEffect(() => {
    const r = document.querySelector(":root");

    muiThemePaletteKeys.forEach(paletteKey => {
      const themeColorObj = theme.palette[paletteKey];

      for (const key in themeColorObj) {
        if (Object.hasOwnProperty.call(themeColorObj, key)) {
          const colorVal = themeColorObj[key];
          r.style.setProperty(`--mui-color-${paletteKey}-${key}`, colorVal);
        }
      }
    });
  }, []);

  return /*#__PURE__*/(
    React.createElement(RecoilRoot, null, /*#__PURE__*/
    React.createElement(Router, null, /*#__PURE__*/
    React.createElement(ThemeProvider, { theme: theme }, /*#__PURE__*/
    React.createElement(CssBaseline, null), /*#__PURE__*/
    React.createElement(App, null)))));




}

ReactDOM.render( /*#__PURE__*/React.createElement(Root, null), document.getElementById("root"));
// # 앱 세팅 끝