import React from "react";
import { Route } from "react-router-dom";
import Dashboard from "../dashboard/Dashboard";
import ListUsers from "../admin/ListUsers";
import StudentReviews from "../admin/StudentReviews";
import UpdateUser from "../admin/UpdateUser";
import ProtectedRoute from "../auth/ProtectedRoute";
import Register from "../auth/Register";
import ListStudentCounseling from "../counseling/ListStudentCounseling";
import StudentCounseling from "../counseling/StudentCounseling";
import StudentCounselingDetails from "../counseling/StudentCounselingDetails";
import UpdateStudentCounseling from "../counseling/UpdateStudentCounseling";
import CourseDetails from "../course/CourseDetails";
import ListCourses from "../course/ListCourses";
import NewCourse from "../course/NewCourse";
import UpdateCourse from "../course/UpdateCourse";
import EventDetails from "../event/EventDetails";
import ListEvents from "../event/ListEvents";
import NewEvent from "../event/NewEvent";
import UpdateEvent from "../event/UpdateEvent";
import AddExam from "../exam/AddExam";
import GradeDetails from "../grade/GradeDetails";
import ListGrades from "../grade/ListGrades";
import NewGrade from "../grade/NewGrade";
import UpdateGrade from "../grade/UpdateGrade";
import AddQuiz from "../quiz/AddQuiz";
import ListStudents from "../student/ListStudents";
import NewStudent from "../student/NewStudent";
import StudentDetails from "../student/StudentDetails";
import UpdateStudent from "../student/UpdateStudent";
import ListTeachers from "../teacher/ListTeachers";
import NewTeacher from "../teacher/NewTeacher";
import TeacherDetails from "../teacher/TeacherDetails";
import UpdateTeacher from "../teacher/UpdateTeacher";
import NewTeacherLeave from "../teacherLeave/NewTeacherLeave";
import AddAttendance from "../attendance/AddAttendance";
import CampusDetails from "../campus/CampusDetails";
import ListCampus from "../campus/ListCampus";
import NewCampus from "../campus/NewCampus";
import UpdateCampus from "../campus/UpdateCampus";
import ListTeacherLeave from "../teacherLeave/ListTeacherLeave";
import UpdateTeacherLeave from "../teacherLeave/UpdateTeacherLeave";
// 👇 FIX: this component existed (as a stub) but was never imported or
// registered as a route anywhere — ListTeacherLeave.jsx's "view details"
// button navigates to /admin/teacher-leave/:id/details, which had no
// matching <Route> at all, hence the 404.
import TeacherLeaveDetails from "../teacherLeave/TeacherLeaveDetails";
import CreateTimeTable from "../timetable/CreateTimeTable";
import NewAcademicLevel from "../timetable/NewAcademiclevel";
import NewClassGroup from "../classgroup/NewClassGroup";
import ListClassGroups from "../classgroup/ListClassGroups";
import SessionTemplate from "../timetable/SessionTemplate";
import UpdateClassGroup from "../classgroup/UpdateClassGroup";
import CreateDaySessionTemplate from "../timetable/CreateDaySessionTemplate";
import CreateWeekDay from "../timetable/CreateWeekDay";
import CreateAndListAcademicYear from "../academicYear/CreateAndListAcademicYear";
// import NewStudentEnrollement from "../studentEnrollment/NewStudentEnrollement";
import ListStudentEnrollement from "../studentEnrollment/ListStudentEnrollement";
import UpdateStudentEnrollement from "../studentEnrollment/UpdateStudentEnrollement";
import StudentEnrollementDetails from "../studentEnrollment/StudentEnrollementDetails";
import ListEmployeeContracts from "../employeeContract/ListEmployeeContracts";
import UpdateEmployeeContract from "../employeeContract/UpdateEmployeeContract";
import GradeDownload from "../grade/GradeDownload";
import CourseDownload from "../course/CourseDownload";
import ClassGroupDetails from "../classgroup/ClassGroupDetails";
import ClassGroupStudents from "../classgroup/ClassGroupStudents";
import ClassGroupDownload from "../classgroup/ClassGroupDownload";
import CreateSchool from "../school/createSchool";
import AttendanceReport from "../attendance/Attendancereport";



const adminRoutes = () => {
  return (
    <>
      <Route
        path="/admin/dashboard"
        element={
          <ProtectedRoute admin={true} teacher={true}>
            <Dashboard />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/register"
        element={
          <ProtectedRoute admin={true}>
            <Register />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grade/new"
        element={
          <ProtectedRoute admin={true}>
            <NewGrade />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grades"
        element={
          <ProtectedRoute admin={true}>
            <ListGrades />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grades/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateGrade />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grade/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <GradeDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/grade/:id/download"
        element={
          <ProtectedRoute admin={true}>
            <GradeDownload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/course/new"
        element={
          <ProtectedRoute admin={true}>
            <NewCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses"
        element={
          <ProtectedRoute admin={true}>
            <ListCourses />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/courses/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateCourse />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/course/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <CourseDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/course/:id/download"
        element={
          <ProtectedRoute admin={true}>
            <CourseDownload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher/new"
        element={
          <ProtectedRoute admin={true}>
            <NewTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers"
        element={
          <ProtectedRoute admin={true}>
            <ListTeachers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teachers/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateTeacher />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <TeacherDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacherleave/new"
        element={
          <ProtectedRoute admin={true}>
            <NewTeacherLeave />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher-leave/:id/edit"
        element={
          <ProtectedRoute admin={true}>
            <UpdateTeacherLeave />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/teacher-leave/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <TeacherLeaveDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/TeacherLeaves"
        element={
          <ProtectedRoute admin={true}>
            <ListTeacherLeave />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students"
        element={
          <ProtectedRoute admin={true}>
            <ListStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/student/new"
        element={
          <ProtectedRoute admin={true}>
            <NewStudent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/students/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateStudent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/student/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <StudentDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/counseling/new"
        element={
          <ProtectedRoute admin={true}>
            <StudentCounseling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/counselings"
        element={
          <ProtectedRoute admin={true}>
            <ListStudentCounseling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/counselings/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateStudentCounseling />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/counseling/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <StudentCounselingDetails />
          </ProtectedRoute>
        }
      />
      {/* add attendance routes */}
      <Route
        path="/admin/attendance/new"
        element={
          <ProtectedRoute admin={true}>
            <AddAttendance />
          </ProtectedRoute>
        }
      />
           <Route
        path="/admin/attendance/report"
        element={
          <ProtectedRoute admin={true}>
            <AttendanceReport />
          </ProtectedRoute>
        }
      />
      {/* add quiz routes */}
      <Route
        path="/admin/quiz/new"
        element={
          <ProtectedRoute admin={true}>
            <AddQuiz />
          </ProtectedRoute>
        }
      />
      {/* add quiz routes */}
      <Route
        path="/admin/exam"
        element={
          <ProtectedRoute admin={true}>
            <AddExam />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/event/new"
        element={
          <ProtectedRoute admin={true}>
            <NewEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events"
        element={
          <ProtectedRoute admin={true}>
            <ListEvents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/events/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateEvent />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/event/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <EventDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users"
        element={
          <ProtectedRoute admin={true}>
            <ListUsers />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/users/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateUser />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/reviews"
        element={
          <ProtectedRoute admin={true}>
            <StudentReviews />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/school/new"
        element={
          <ProtectedRoute admin={true}>
            <CreateSchool />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/campus/new"
        element={
          <ProtectedRoute admin={true}>
            <NewCampus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/campuses"
        element={
          <ProtectedRoute admin={true}>
            <ListCampus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/campus/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateCampus />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/campus/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <CampusDetails />
          </ProtectedRoute>
        }
      />

      <Route
        path="/admin/academic-level/new"
        element={
          <ProtectedRoute admin={true}>
            <CreateTimeTable />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/academic-level/"
        element={
          <ProtectedRoute admin={true}>
            <NewAcademicLevel />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/class-groups/new"
        element={
          <ProtectedRoute admin={true}>
            <NewClassGroup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/class-groups"
        element={
          <ProtectedRoute admin={true}>
            <ListClassGroups />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/class-groups/:id"
        element={
          <ProtectedRoute admin={true}>
            <UpdateClassGroup />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/class-group/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <ClassGroupDetails />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/class-groups/:id/students"
        element={
          <ProtectedRoute admin={true}>
            <ClassGroupStudents />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/class-group/:id/download"
        element={
          <ProtectedRoute admin={true}>
            <ClassGroupDownload />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/session-templates"
        element={
          <ProtectedRoute admin={true}>
            <SessionTemplate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/week-day"
        element={
          <ProtectedRoute admin={true}>
            <CreateWeekDay />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/day-session-template/new"
        element={
          <ProtectedRoute admin={true}>
            <CreateDaySessionTemplate />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/AcademicYear/new"
        element={
          <ProtectedRoute admin={true}>
            <CreateAndListAcademicYear />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/studentenrollements"
        element={
          <ProtectedRoute admin={true}>
            <ListStudentEnrollement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/student-enrollments/:studentId"
        element={
          <ProtectedRoute admin={true}>
            <UpdateStudentEnrollement />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/studentenrollement/:id/details"
        element={
          <ProtectedRoute admin={true}>
            <StudentEnrollementDetails />
          </ProtectedRoute>
        }
      />


      <Route
        path="/admin/employee-contracts"
        element={
          <ProtectedRoute admin={true}>
            <ListEmployeeContracts />
          </ProtectedRoute>
        }
      />
      <Route
        path="/admin/employee-contracts/:employeeId"
        element={
          <ProtectedRoute admin={true}>
            <UpdateEmployeeContract />
          </ProtectedRoute>
        }
      />


    </>
  );
};

export default adminRoutes;