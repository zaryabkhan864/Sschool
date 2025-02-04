import { Toaster } from "react-hot-toast";
import { Route, BrowserRouter as Router, Routes } from "react-router-dom";
import Footer from "./components/layout/Footer";
import Header from "./components/layout/Header";
import NotFound from "./components/layout/NotFound";
import useAdminRoutes from "./components/routes/adminRoutes";
import useTeacherRoutes from "./components/routes/teacherRoutes";
import useUserRoutes from "./components/routes/userRoutes";

function App() {
  const userRoutes = useUserRoutes();
  const adminRoutes = useAdminRoutes();
  const teacherRoutes = useTeacherRoutes();

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
            <Route path="*" element={<NotFound />} />
          </Routes>
        </div>

        <Footer />
      </Router>
    </div>
  );
}

export default App;
