import { BrowserRouter } from 'react-router-dom'
import Theme from '@/components/template/Theme'
import Layout from '@/components/layouts'
import { AuthProvider } from '@/auth'
import Views from '@/views'
import appConfig from './configs/app.config'
import './locales'

<<<<<<< HEAD
if (appConfig.enableMock) {
    import('./mock')
=======
import viteLogo from "/vite.svg";
import Attendance from "./Attendance/Attendance";

function App() {
  const [count, setCount] = useState(0);

  return (
    <>
      <Attendance/>
    </>
  );
>>>>>>> 638286203ab710108e5caa66f86f4a40affa62f5
}

function App() {
    return (
        <Theme>
            <BrowserRouter>
                <AuthProvider>
                    <Layout>
                        <Views />
                    </Layout>
                </AuthProvider>
            </BrowserRouter>
        </Theme>
    )
}

export default App
