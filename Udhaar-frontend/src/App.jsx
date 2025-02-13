import AppRoutes from './routes';
import "./App.css";
import "./index.css"
import { ModalProvider } from "./context/ModalContext";
import Modal from "./components/Modal";
//import Animation from "./components/animation";
//import "react-toastify/dist/ReactToastify.css";

function App() {
  return (
    <>
      {/* <Animation /> */}
      <ModalProvider>
        <AppRoutes />
        <Modal />
      </ModalProvider>
    </>
  );
}

export default App;
