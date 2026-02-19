import React, { useState, useEffect } from 'react';
import { useSelector } from 'react-redux';
import toast from 'react-hot-toast';

import MetaData from '../layout/MetaData';
import Loader from '../layout/Loader';

import { useGetStudentsExamDetailsByExamDataMutation, useUpdateExamMarksMutation } from '../../redux/api/examApi';
import { useTranslation } from 'react-i18next';
import AdminLayout from '../layout/AdminLayout';
import { useGetCoursesByRoleQuery } from '../../redux/api/courseApi';

const AddExam = () => {
    const { t } = useTranslation();
    const [userDetails, setUserDetails] = useState({});
    const [classGroups, setClassGroups] = useState([]);
    const [courses, setCourses] = useState([]);
    const [filteredCourses, setFilteredCourses] = useState([]);
    const [examDetails, setExamDetails] = useState(null);
    const [marks, setMarks] = useState({});
    const [isLoadingExam, setIsLoadingExam] = useState(false);
    const [isCreatingNew, setIsCreatingNew] = useState(false);

    const [formValues, setFormValues] = useState({
        classGroup: '',
        course: '',
        semester: '',
        quarter: '',
        user: '',
        campus: '',
        year: ''
    });

    const { user } = useSelector((state) => state.auth);

    // 1. Get user details and set user field in formValues
    useEffect(() => {
        if (user && user._id) {
            const campusFromCookie = document.cookie
                .split("; ")
                .find((row) => row.startsWith("campus="))
                ?.split("=")[1];

            const yearFromCookie = document.cookie
                .split("; ")
                .find((row) => row.startsWith("selectedYear="))
                ?.split("=")[1];

            setFormValues((prevFormValues) => ({
                ...prevFormValues,
                user: user._id,
                campus: campusFromCookie,
                year: Number(yearFromCookie)
            }));

            setUserDetails({
                userId: user._id,
                userRole: user.role,
            });
        }
    }, [user]);

    // 2. Get class groups and courses based on user role
    const { 
        data: roleData, 
        isLoading: roleLoading,
        refetch: refetchRoleData 
    } = useGetCoursesByRoleQuery({
        userId: userDetails.userId,
        userRole: userDetails.userRole
    }, {
        skip: !userDetails.userId || !userDetails.userRole,
        refetchOnMountOrArgChange: true
    });

    // 3. Process role data when it loads
    useEffect(() => {
        if (roleData) {
            // Set class groups
            const allClassGroups = roleData.classGroups || [];
            setClassGroups(allClassGroups);
            
            // Set all courses
            const allCourses = roleData.courses || [];
            setCourses(allCourses);
            
            // If there's a selected class group, filter courses for it
            if (formValues.classGroup && allClassGroups.length > 0) {
                const selectedClassGroup = allClassGroups.find(
                    group => group._id === formValues.classGroup
                );
                if (selectedClassGroup && selectedClassGroup.courses) {
                    setFilteredCourses(selectedClassGroup.courses);
                } else {
                    setFilteredCourses([]);
                }
            } else {
                setFilteredCourses(allCourses);
            }
        }
    }, [roleData, formValues.classGroup]);

    // 4. Reset courses when class group changes
    useEffect(() => {
        if (formValues.classGroup && classGroups.length > 0) {
            const selectedClassGroup = classGroups.find(
                group => group._id === formValues.classGroup
            );
            if (selectedClassGroup && selectedClassGroup.courses) {
                setFilteredCourses(selectedClassGroup.courses);
            } else {
                setFilteredCourses([]);
            }
            // Reset course selection
            setFormValues(prev => ({ ...prev, course: '' }));
        } else {
            setFilteredCourses(courses);
        }
    }, [formValues.classGroup, classGroups, courses]);

    const [getExamDetails] = useGetStudentsExamDetailsByExamDataMutation();
    const [updateExamMarks, { isLoading: updateExamMarksLoading }] = useUpdateExamMarksMutation();

    // Function to fetch exam details
    const fetchExamDetails = async () => {
        if (
            formValues.classGroup &&
            formValues.course &&
            formValues.semester &&
            formValues.quarter &&
            formValues.user &&
            formValues.campus &&
            formValues.year
        ) {
            setIsLoadingExam(true);
            setIsCreatingNew(false);
            try {
                const selectedCourse = filteredCourses.find(
                    (item) => item._id === formValues.course
                );
                
                // Get the selected class group to get the grade
                const selectedClassGroup = classGroups.find(
                    group => group._id === formValues.classGroup
                );
                
                const examData = {
                    grade: selectedClassGroup?.grade?._id || formValues.classGroup,
                    classGroup: formValues.classGroup,
                    course: formValues.course,
                    semester: formValues.semester,
                    quarter: formValues.quarter,
                    user: selectedCourse?.teacher || formValues.user,
                    campus: formValues.campus,
                    year: formValues.year
                };

                const response = await getExamDetails(examData).unwrap();

                if (response.exam) {
                    setExamDetails(response.exam);
                    // Initialize marks state with student IDs
                    const initialMarks = {};
                    response.exam.marks.forEach(mark => {
                        initialMarks[mark.student] = {
                            ...mark,
                            studentName: mark.studentName
                        };
                    });
                    setMarks(initialMarks);
                    toast.success('Exam loaded successfully!');
                } else {
                    // No exam found, we can create a new one
                    setIsCreatingNew(true);
                    toast.info('No exam found. You can create a new one.');
                    
                    // Pre-populate marks with students from class group (if available)
                    // This would require fetching students for the class group
                    // For now, we'll set empty marks
                    setExamDetails(null);
                    setMarks({});
                }
            } catch (err) {
                console.error('Error fetching exam details:', err);
                if (err.status === 404) {
                    setIsCreatingNew(true);
                    toast.info('No exam found. You can create a new one.');
                    setExamDetails(null);
                    setMarks({});
                } else {
                    toast.error('Failed to fetch exam details.');
                    setExamDetails(null);
                    setMarks({});
                }
            } finally {
                setIsLoadingExam(false);
            }
        }
    };

    const handleDropdownChange = (event) => {
        const { name, value } = event.target;
        
        setFormValues((prevState) => ({
            ...prevState,
            [name]: value,
            ...(name === 'classGroup' && { 
                course: '', 
                semester: '', 
                quarter: '' 
            }),
            ...(name === 'course' && { 
                semester: '', 
                quarter: '' 
            }),
            ...(name === 'semester' && { 
                quarter: '' 
            }),
        }));
        
        // Reset exam details when any dropdown changes
        if (name !== 'semester' && name !== 'quarter') {
            setExamDetails(null);
            setMarks({});
            setIsCreatingNew(false);
        }
    };

    const handleMarkChange = (studentId, markIndex, value) => {
        setMarks(prevMarks => ({
            ...prevMarks,
            [studentId]: {
                ...prevMarks[studentId],
                [`question${markIndex}`]: parseInt(value) || 0
            }
        }));
    };

    const handleSubmitMarks = async () => {
        if (!formValues.classGroup || !formValues.course || 
            !formValues.semester || !formValues.quarter) {
            toast.error('Please select all required fields');
            return;
        }
        
        try {
            // Convert marks object to array format expected by the API
            const marksArray = Object.keys(marks).map(studentId => {
                const markObj = {
                    student: studentId
                };
                
                // Add all 10 questions
                for (let i = 1; i <= 10; i++) {
                    markObj[`question${i}`] = marks[studentId][`question${i}`] || 0;
                }
                
                return markObj;
            });

            // Get selected class group and course
            const selectedClassGroup = classGroups.find(
                group => group._id === formValues.classGroup
            );
            const selectedCourse = filteredCourses.find(
                course => course._id === formValues.course
            );

            const payload = {
                examId: examDetails?._id || null, // null for new exam
                grade: selectedClassGroup?.grade?._id || formValues.classGroup,
                classGroup: formValues.classGroup,
                course: formValues.course,
                semester: formValues.semester,
                quarter: formValues.quarter,
                user: selectedCourse?.teacher || formValues.user,
                campus: formValues.campus,
                year: formValues.year,
                marks: marksArray
            };
            
            await updateExamMarks({ id: examDetails?._id || 'new', body: payload }).unwrap();
            toast.success(isCreatingNew ? 'Exam created successfully!' : 'Exam marks updated successfully!');
            
            // Refresh exam details
            if (isCreatingNew) {
                fetchExamDetails();
            }
        } catch (err) {
            console.error('Error submitting marks:', err);
            toast.error('Failed to submit marks.');
        }
    };

    // Check if all required fields are selected to enable the fetch button
    const canFetchExam = formValues.classGroup && formValues.course &&
        formValues.semester && formValues.quarter;

    // Helper function to get display name for class group
    const getClassGroupDisplay = (classGroup) => {
        if (!classGroup) return '';
        
        if (classGroup.displayName) {
            return classGroup.displayName;
        }
        
        const gradeName = classGroup.grade?.gradeName || 'Grade';
        return `${gradeName} - ${classGroup.section}`;
    };

    // Transform class groups for dropdown
    const classGroupOptions = classGroups.map(group => ({
        ...group,
        displayLabel: getClassGroupDisplay(group)
    }));

    // Get selected class group and course for display
    const selectedClassGroup = classGroups.find(g => g._id === formValues.classGroup);
    const selectedCourse = filteredCourses.find(c => c._id === formValues.course);

    // Calculate total marks for a student
    const calculateTotalMarks = (studentMarks) => {
        let total = 0;
        for (let i = 1; i <= 10; i++) {
            total += studentMarks[`question${i}`] || 0;
        }
        return total;
    };

    // Calculate statistics
    const calculateStatistics = () => {
        const studentCount = Object.keys(marks).length;
        if (studentCount === 0) return null;

        const totals = Object.values(marks).map(mark => calculateTotalMarks(mark));
        const average = totals.reduce((a, b) => a + b, 0) / studentCount;
        const highest = Math.max(...totals);
        const lowest = Math.min(...totals);

        return { studentCount, average, highest, lowest };
    };

    const statistics = calculateStatistics();

    return (
        <AdminLayout>
            <MetaData title={'Add Exam Marks'} />
            
            {/* Show loader while fetching role data */}
            {roleLoading && <Loader />}
            
            {/* Main container */}
            <div className="container mx-auto px-4 py-8">
                {/* Header */}
                <div className="mb-8">
                    <h1 className="text-3xl font-bold text-gray-800">Exam Management</h1>
                    <p className="text-gray-600 mt-2">Add or update exam marks for your classes</p>
                </div>

                {/* Selection Panel */}
                <div className="bg-white rounded-xl shadow-lg p-6 mb-8">
                    <h2 className="text-xl font-semibold text-gray-800 mb-4">Select Exam Parameters</h2>
                    
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                        {/* Class Group Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Class/Section
                            </label>
                            <select
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                name="classGroup"
                                value={formValues.classGroup}
                                onChange={handleDropdownChange}
                                disabled={roleLoading || classGroups.length === 0}
                            >
                                <option value="">Select Class/Section</option>
                                {classGroupOptions.map((classGroup) => (
                                    <option key={classGroup._id} value={classGroup._id}>
                                        {classGroup.displayLabel}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Course Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Course
                            </label>
                            <select
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                name="course"
                                value={formValues.course}
                                onChange={handleDropdownChange}
                                disabled={!formValues.classGroup || filteredCourses.length === 0}
                            >
                                <option value="">Select Course</option>
                                {filteredCourses.map((course) => (
                                    <option key={course._id} value={course._id}>
                                        {course.courseName}
                                    </option>
                                ))}
                            </select>
                        </div>

                        {/* Semester Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Semester
                            </label>
                            <select
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                name="semester"
                                value={formValues.semester}
                                onChange={handleDropdownChange}
                                disabled={!formValues.classGroup || !formValues.course}
                            >
                                <option value="">Select Semester</option>
                                <option value="1">Semester 1</option>
                                <option value="2">Semester 2</option>
                            </select>
                        </div>

                        {/* Quarter Dropdown */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Quarter
                            </label>
                            <select
                                className="w-full border border-gray-300 p-3 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors disabled:bg-gray-100 disabled:cursor-not-allowed"
                                name="quarter"
                                value={formValues.quarter}
                                onChange={handleDropdownChange}
                                disabled={!formValues.classGroup || !formValues.course || !formValues.semester}
                            >
                                <option value="">Select Quarter</option>
                                <option value="1">Quarter 1</option>
                                <option value="2">Quarter 2</option>
                            </select>
                        </div>
                    </div>

                    {/* Fetch/Create Button */}
                    {canFetchExam && (
                        <div className="mt-6 flex justify-center">
                            <button
                                className="bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 px-8 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                onClick={fetchExamDetails}
                                disabled={isLoadingExam || roleLoading}
                            >
                                {isLoadingExam ? (
                                    <span className="flex items-center">
                                        <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                        </svg>
                                        Loading...
                                    </span>
                                ) : examDetails ? 'Reload Exam' : 'Fetch Exam'}
                            </button>
                        </div>
                    )}
                </div>

                {/* No data message */}
                {!roleLoading && classGroups.length === 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-xl p-6 text-center">
                        <svg className="w-12 h-12 text-yellow-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-2.5L13.732 4c-.77-.833-1.964-.833-2.732 0L4.732 16.5c-.77.833.192 2.5 1.732 2.5z"></path>
                        </svg>
                        <h3 className="text-lg font-semibold text-yellow-800 mb-2">No Class Groups Assigned</h3>
                        <p className="text-yellow-600">You don't have any class groups or courses assigned to you.</p>
                    </div>
                )}

                {/* Loading State */}
                {isLoadingExam && (
                    <div className="flex flex-col items-center justify-center py-12">
                        <Loader />
                        <p className="mt-4 text-gray-600">Loading exam data...</p>
                    </div>
                )}

                {/* Exam Details Section */}
                {(examDetails || isCreatingNew) && !isLoadingExam && (
                    <div className="bg-white rounded-xl shadow-lg overflow-hidden">
                        {/* Exam Header */}
                        <div className="bg-gradient-to-r from-blue-600 to-blue-800 p-6 text-white">
                            <div className="flex flex-col md:flex-row md:items-center justify-between">
                                <div>
                                    <h2 className="text-2xl font-bold">
                                        {examDetails ? 'Exam Details' : 'Create New Exam'}
                                    </h2>
                                    <div className="mt-2 flex flex-wrap gap-4">
                                        <div className="flex items-center">
                                            <span className="text-blue-200">Class:</span>
                                            <span className="ml-2 font-medium">{getClassGroupDisplay(selectedClassGroup)}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-blue-200">Course:</span>
                                            <span className="ml-2 font-medium">{selectedCourse?.courseName || 'N/A'}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-blue-200">Semester:</span>
                                            <span className="ml-2 font-medium">{formValues.semester}</span>
                                        </div>
                                        <div className="flex items-center">
                                            <span className="text-blue-200">Quarter:</span>
                                            <span className="ml-2 font-medium">{formValues.quarter}</span>
                                        </div>
                                    </div>
                                </div>
                                {examDetails && (
                                    <div className="mt-4 md:mt-0 text-sm">
                                        <div className="bg-blue-500 bg-opacity-30 px-3 py-1 rounded-full inline-block">
                                            Exam ID: {examDetails._id?.substring(0, 8)}...
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Statistics Bar */}
                        {statistics && Object.keys(marks).length > 0 && (
                            <div className="bg-gray-50 border-b border-gray-200 p-4">
                                <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-gray-800">{statistics.studentCount}</div>
                                        <div className="text-sm text-gray-600">Students</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-green-600">{statistics.average.toFixed(1)}</div>
                                        <div className="text-sm text-gray-600">Average Score</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-blue-600">{statistics.highest}</div>
                                        <div className="text-sm text-gray-600">Highest Score</div>
                                    </div>
                                    <div className="text-center">
                                        <div className="text-2xl font-bold text-red-600">{statistics.lowest}</div>
                                        <div className="text-sm text-gray-600">Lowest Score</div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* Marks Table */}
                        <div className="p-6">
                            {Object.keys(marks).length > 0 ? (
                                <div className="overflow-x-auto">
                                    <table className="min-w-full divide-y divide-gray-200">
                                        <thead className="bg-gray-50">
                                            <tr>
                                                <th scope="col" className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Student
                                                </th>
                                                {[...Array(10)].map((_, index) => (
                                                    <th key={index} scope="col" className="px-3 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                        Q{index + 1}
                                                    </th>
                                                ))}
                                                <th scope="col" className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                                    Total
                                                </th>
                                            </tr>
                                        </thead>
                                        <tbody className="bg-white divide-y divide-gray-200">
                                            {Object.entries(marks).map(([studentId, markData]) => (
                                                <tr key={studentId} className="hover:bg-gray-50 transition-colors">
                                                    <td className="px-6 py-4 whitespace-nowrap">
                                                        <div className="flex items-center">
                                                            <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                                <span className="text-blue-600 font-semibold">
                                                                    {markData.studentName?.charAt(0) || 'S'}
                                                                </span>
                                                            </div>
                                                            <div className="ml-4">
                                                                <div className="text-sm font-medium text-gray-900">
                                                                    {markData.studentName || `Student ${studentId.substring(0, 6)}`}
                                                                </div>
                                                                <div className="text-sm text-gray-500">
                                                                    ID: {studentId.substring(0, 8)}...
                                                                </div>
                                                            </div>
                                                        </div>
                                                    </td>
                                                    {[...Array(10)].map((_, index) => (
                                                        <td key={index} className="px-3 py-4 whitespace-nowrap">
                                                            <input
                                                                type="number"
                                                                min="0"
                                                                max="100"
                                                                className="w-16 mx-auto block text-center border border-gray-300 rounded-md py-2 px-3 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-colors"
                                                                value={markData[`question${index + 1}`] || 0}
                                                                onChange={(e) => handleMarkChange(studentId, index + 1, e.target.value)}
                                                                onFocus={(e) => e.target.select()}
                                                            />
                                                        </td>
                                                    ))}
                                                    <td className="px-6 py-4 whitespace-nowrap text-center">
                                                        <span className="px-3 py-1 inline-flex text-sm leading-5 font-semibold rounded-full bg-blue-100 text-blue-800">
                                                            {calculateTotalMarks(markData)}
                                                        </span>
                                                    </td>
                                                </tr>
                                            ))}
                                        </tbody>
                                    </table>
                                </div>
                            ) : (
                                <div className="text-center py-12">
                                    <svg className="w-16 h-16 text-gray-400 mx-auto mb-4" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z"></path>
                                    </svg>
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                                        {isCreatingNew ? 'No Students Found' : 'No Marks Available'}
                                    </h3>
                                    <p className="text-gray-600 max-w-md mx-auto">
                                        {isCreatingNew 
                                            ? 'No students are enrolled in this class group yet. Please add students first.'
                                            : 'This exam has no marks recorded yet. Start adding marks below.'}
                                    </p>
                                </div>
                            )}

                            {/* Submit Button */}
                            {(Object.keys(marks).length > 0 || isCreatingNew) && (
                                <div className="mt-8 pt-6 border-t border-gray-200">
                                    <div className="flex flex-col md:flex-row md:items-center justify-between">
                                        <div className="mb-4 md:mb-0">
                                            <p className="text-sm text-gray-600">
                                                {isCreatingNew 
                                                    ? 'You are creating a new exam record.'
                                                    : `You are updating an existing exam with ${Object.keys(marks).length} student(s).`}
                                            </p>
                                            {examDetails && (
                                                <p className="text-xs text-gray-500 mt-1">
                                                    Last updated: {new Date(examDetails.updatedAt).toLocaleDateString()}
                                                </p>
                                            )}
                                        </div>
                                        <button
                                            className="bg-green-600 hover:bg-green-700 text-white font-medium py-3 px-8 rounded-lg shadow-md transition-all duration-200 hover:shadow-lg disabled:bg-gray-300 disabled:cursor-not-allowed disabled:hover:shadow-none"
                                            onClick={handleSubmitMarks}
                                            disabled={updateExamMarksLoading}
                                        >
                                            {updateExamMarksLoading ? (
                                                <span className="flex items-center">
                                                    <svg className="animate-spin h-5 w-5 mr-2 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                                                        <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                                                        <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                                                    </svg>
                                                    Processing...
                                                </span>
                                            ) : (
                                                isCreatingNew ? 'Create Exam' : 'Update Exam Marks'
                                            )}
                                        </button>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                )}

                {/* Information Box */}
                <div className="mt-8 bg-blue-50 border border-blue-200 rounded-xl p-6">
                    <div className="flex items-start">
                        <svg className="w-6 h-6 text-blue-500 mr-3 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"></path>
                        </svg>
                        <div>
                            <h3 className="text-lg font-medium text-blue-800 mb-2">How to Use This Page</h3>
                            <ul className="text-blue-700 space-y-2">
                                <li>1. Select your class/section from the dropdown</li>
                                <li>2. Choose the course you want to add exam marks for</li>
                                <li>3. Select the semester and quarter</li>
                                <li>4. Click "Fetch Exam" to load existing exam or create new</li>
                                <li>5. Enter marks for each student (0-100 for each question)</li>
                                <li>6. Click "Create Exam" or "Update Exam Marks" to save</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </AdminLayout>
    );
};

export default AddExam;