import { Toaster } from "react-hot-toast";
import 'react-phone-input-2/lib/style.css';

import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import NotFound from "./components/layout/NotFound";
import useAdminRoutes from "./components/routes/adminRoutes";
import useTeacherRoutes from "./components/routes/teacherRoutes";
import useUserRoutes from "./components/routes/userRoutes";
import useFinanceRoutes from "./components/routes/financeRoutes";
import useStudentRoutes from "./components/routes/studentRoutes";
import useCounselorRoutes from "./components/routes/counsellorRoutes";
import usePrincipleRoutes from "./components/routes/principleRoutes";
import useReportsRoutes from "./components/routes/reportsRoutes"

function App() {
  const userRoutes = useUserRoutes();
  const adminRoutes = useAdminRoutes();
  const teacherRoutes = useTeacherRoutes();
  const financeRoutes = useFinanceRoutes();
  const studentRoutes = useStudentRoutes();
  const counselorRoutes = useCounselorRoutes();
  const principleRoutes = usePrincipleRoutes();
  const reportsRoutes = useReportsRoutes();
  return (
    <div className="h-screen flex flex-col">
      <Router>
        <Toaster position="top-center" />
        <Header />

        {/* Routes will take full height except Header & Footer */}
        <div className=" ">
          <Routes>
            {userRoutes}
            {adminRoutes}
            {teacherRoutes}
            {financeRoutes}
            {studentRoutes}
            {counselorRoutes}
            {principleRoutes}
            {reportsRoutes}
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        <Footer />
      </Router>
    </div>
  );
}

export default App;
