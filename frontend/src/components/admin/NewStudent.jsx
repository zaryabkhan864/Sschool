import React, { useEffect, useState } from "react";
import Loader from "../layout/Loader";
import { toast } from "react-hot-toast";

import MetaData from "../layout/MetaData";
import AdminLayout from "../layout/AdminLayout";
import { useNavigate } from "react-router-dom";
import { useCreateStudentMutation } from "../../redux/api/studentsApi";

const NewStudent = () => {
    const navigate = useNavigate();

    const [student, setStudent] = useState({
        studentName: "",
        age: "",
        gender: "",
        nationality: "",
        studentPhoneNumber: "",
        parentOnePhoneNumber: "",
        parentTwoPhoneNumber: "",
    });

    const {
        studentName,
        age,
        gender,
        nationality,
        studentPhoneNumber,
        parentOnePhoneNumber,
        parentTwoPhoneNumber,
    } = student;

    const [createStudent, { isLoading, error, isSuccess }] = useCreateStudentMutation();

    useEffect(() => {
        if (error) {
            toast.error(error?.data?.message);
        }

        if (isSuccess) {
            toast.success("Student created");
            navigate("/admin/students");
        }
    }, [error, isSuccess, navigate]);

    const onChange = (e) => {
        setStudent({ ...student, [e.target.name]: e.target.value });
    };

    const submitHandler = (e) => {
        e.preventDefault();
        createStudent(student);
    };

    return (
        <AdminLayout>
            <MetaData title={"Create New Student"} />
            <div className="flex justify-center items-center min-h-screen bg-gray-100">
                <form className="w-full max-w-lg p-6 bg-white shadow-md rounded-md" onSubmit={submitHandler}>
                    <h2 className="text-2xl font-bold text-gray-800 mb-6">New Student</h2>

                    <div className="mb-4">
                        <label htmlFor="studentName_field" className="block text-gray-700 font-medium mb-2">
                            Student Name
                        </label>
                        <input
                            type="text"
                            id="studentName_field"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            name="studentName"
                            value={studentName}
                            onChange={onChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="age_field" className="block text-gray-700 font-medium mb-2">
                            Age
                        </label>
                        <input
                            type="number"
                            id="age_field"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            name="age"
                            value={age}
                            onChange={onChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="gender_field" className="block text-gray-700 font-medium mb-2">
                            Gender
                        </label>
                        <select
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            id="gender_field"
                            name="gender"
                            value={gender}
                            onChange={onChange}
                        >
                            <option value="">Select Gender</option>
                            <option value="Male">Male</option>
                            <option value="Female">Female</option>
                            <option value="Other">Other</option>
                        </select>
                    </div>

                    <div className="mb-4">
                        <label htmlFor="nationality_field" className="block text-gray-700 font-medium mb-2">
                            Nationality
                        </label>
                        <input
                            type="text"
                            id="nationality_field"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            name="nationality"
                            value={nationality}
                            onChange={onChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="studentPhoneNumber_field" className="block text-gray-700 font-medium mb-2">
                            Student Phone Number
                        </label>
                        <input
                            type="text"
                            id="studentPhoneNumber_field"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            name="studentPhoneNumber"
                            value={studentPhoneNumber}
                            onChange={onChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="parentOnePhoneNumber_field" className="block text-gray-700 font-medium mb-2">
                            Parent 1 Phone Number
                        </label>
                        <input
                            type="text"
                            id="parentOnePhoneNumber_field"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            name="parentOnePhoneNumber"
                            value={parentOnePhoneNumber}
                            onChange={onChange}
                        />
                    </div>

                    <div className="mb-4">
                        <label htmlFor="parentTwoPhoneNumber_field" className="block text-gray-700 font-medium mb-2">
                            Parent 2 Phone Number (Optional)
                        </label>
                        <input
                            type="text"
                            id="parentTwoPhoneNumber_field"
                            className="w-full px-3 py-2 border rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                            name="parentTwoPhoneNumber"
                            value={parentTwoPhoneNumber}
                            onChange={onChange}
                        />
                    </div>

                    <button
                        type="submit"
                        className="w-full py-2 text-white bg-blue-600 hover:bg-blue-700 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        disabled={isLoading}
                    >
                        {isLoading ? "Creating..." : "CREATE"}
                    </button>
                </form>
            </div>
        </AdminLayout>
    );
};

export default NewStudent;
