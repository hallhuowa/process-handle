import {BrowserRouter,Routes,Route} from 'react-router-dom';
//导入页面组件
import Login from "./views/Login/Login";
import Layout from "./views/Layout/Layout";
import Role from "./views/Role/Role";
import User from "./views/User/User";
import Process from "./views/Process/Process";
export const successCode = '0000'
function App() {
  return (
    <BrowserRouter>
      <Routes>
          <Route path='/' element={<Login/>} />
          <Route path='/layout' element={<Layout/>}>
              <Route path='role' element={<Role/>} />
              <Route path='user' element={<User/>} />
              <Route path='process' element={<Process/>} />
          </Route>
      </Routes>
    </BrowserRouter>
  );
}

export default App;
