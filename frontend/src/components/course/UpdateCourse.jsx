import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useTranslation } from "react-i18next";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import {
  useGetCourseDetailsQuery,
  useUpdateCourseMutation,
} from "../../redux/api/courseApi";
import { useGetUserByTypeQuery } from "../../redux/api/userApi";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";
import ConfirmationModal from "../GUI/ConfirmationModal";

const UpdateCourse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();

  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    teacher: "",
  });

  const [teacherSearch, setTeacherSearch] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(""); 
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [teachersList, setTeachersList] = useState([]); 
  const [hasMore, setHasMore] = useState(true);
  const [initialLoadDone, setInitialLoadDone] = useState(false);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const observer = useRef();
  const searchTimeoutRef = useRef(null);

  const { courseName, description, code, teacher } = course;

  const [updateCourse, { isLoading, error, isSuccess }] = useUpdateCourseMutation();
  const { data: courseData, isLoading: detailsLoading } = useGetCourseDetailsQuery(params?.id);
  
  const { 
    data: teachersData, 
    isFetching: teacherLoading, 
    error: teacherError,
    refetch: refetchTeachers
  } = useGetUserByTypeQuery({ 
    type: "teacher",
    status: "active",
    page: page,
    limit: 10, 
    keyword: debouncedSearch 
  }, {
    refetchOnMountOrArgChange: true,
    skip: false
  });

  // ✅ Debounce logic
  useEffect(() => {
    if (searchTimeoutRef.current) clearTimeout(searchTimeoutRef.current);
    searchTimeoutRef.current = setTimeout(() => {
      setDebouncedSearch(teacherSearch);
    }, 300);
    return () => clearTimeout(searchTimeoutRef.current);
  }, [teacherSearch]);

  useEffect(() => {
    if (!initialLoadDone) {
      refetchTeachers();
      setInitialLoadDone(true);
    }
  }, [initialLoadDone, refetchTeachers]);

  const lastTeacherElementRef = useCallback(node => {
    if (teacherLoading) return;
    if (observer.current) observer.current.disconnect();
    observer.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !teacherLoading) {
        setPage(prevPage => prevPage + 1);
      }
    });
    if (node) observer.current.observe(node);
  }, [teacherLoading, hasMore]);

  useEffect(() => {
    if (teachersData?.users) {
      if (page === 1) {
        setTeachersList(teachersData.users);
      } else {
        setTeachersList(prev => {
          const combined = [...prev, ...teachersData.users];
          const uniqueMap = new Map();
          combined.forEach(user => uniqueMap.set(user._id, user));
          return Array.from(uniqueMap.values());
        });
      }
      setHasMore(teachersData.users.length === 10);
    }
  }, [teachersData, page]);

  // Reset list on search
  useEffect(() => {
    setPage(1);
    setHasMore(true);
  }, [debouncedSearch]);

  // ✅ FIX: Only sync teacher name if the search field is empty (Initial load)
  useEffect(() => {
    if (courseData?.course && teacherSearch === "" && !initialLoadDone) {
      const currentTeacher = courseData.course.teacher;
      // We set the ID in state, search label will be handled by courseData check or Memo
      if (typeof currentTeacher === 'object') {
        setTeacherSearch(currentTeacher.name || "");
      }
    }
  }, [courseData, initialLoadDone]);

  useEffect(() => {
    if (courseData?.course) {
      setCourse({
        courseName: courseData.course.courseName || "",
        description: courseData.course.description || "",
        code: courseData.course.code || "",
        teacher: courseData.course.teacher?._id || courseData.course.teacher || "",
      });
      // Set initial search name if teacher exists
      if(courseData.course.teacher?.name) {
          setTeacherSearch(courseData.course.teacher.name);
      }
    }
  }, [courseData]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowTeacherDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    if (error) toast.error(error?.data?.message);
    if (teacherError) toast.error("Failed to load teachers");
    if (isSuccess) {
      toast.success(t("Course Updated"));
      navigate("/admin/courses");
    }
  }, [error, isSuccess, navigate, t, teacherError]);

  const selectedTeacherName = useMemo(() => {
    const foundInList = teachersList.find(t => t._id === teacher);
    if (foundInList) return foundInList.name;
    // Fallback to courseData name if list hasn't loaded it yet
    if (courseData?.course?.teacher?._id === teacher) return courseData.course.teacher.name;
    return "";
  }, [teacher, teachersList, courseData]);

  const [showModal, setShowModal] = useState(false);

  const onChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleTeacherSelect = (teacherId, teacherName) => {
    setCourse({ ...course, teacher: teacherId });
    setTeacherSearch(teacherName);
    setShowTeacherDropdown(false);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    if (!courseName.trim()) return toast.error(t("Course name is required"));
    if (!code.trim() || code.length !== 8) return toast.error(t("Course code must be 8 characters"));
    if (!teacher) return toast.error(t("Please select a teacher"));
    setShowModal(true);
  };

  const confirmUpdate = () => {
    updateCourse({ id: params?.id, body: course });
    setShowModal(false);
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white placeholder:text-gray-400";
  const labelClass = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1";

  if (detailsLoading) return <Loader />;

  return (
    <AdminLayout>
      <MetaData title={t("Update Course")} />
      <div className="max-w-6xl mx-auto py-4 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t('Update Course')}</h1>
            <p className="text-xs text-gray-500">{t('Update course information and details')}</p>
          </div>
          <button onClick={() => navigate("/admin/courses")} className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50">
            <i className="fa fa-arrow-left mr-1"></i> {t('back')}
          </button>
        </div>

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa fa-book text-blue-500 text-sm"></i>
                <h3 className="font-bold text-sm text-gray-800">{t('Course Information')}</h3>
              </div>
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>{t('Course Name')} *</label>
                  <input type="text" name="courseName" value={courseName} onChange={onChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>{t('Description')}</label>
                  <textarea name="description" value={description} onChange={onChange} rows="3" className={`${inputClass} resize-none`}></textarea>
                </div>
              </div>
            </div>

            <div className="p-5 bg-gray-50/30">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa fa-cog text-green-500 text-sm"></i>
                <h3 className="font-bold text-sm text-gray-800">{t('Course Details')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <label className={labelClass}>{t('Course Code')} *</label>
                  <input type="text" name="code" value={code} onChange={onChange} className={inputClass} maxLength={8} minLength={8} required />
                </div>
                
                <div className="relative">
                  <label className={labelClass}>{t('Assigned Teacher')} *</label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      className={`${inputClass} pr-10`}
                      placeholder="Type to search teacher..."
                      value={teacherSearch}
                      onChange={(e) => {
                        setTeacherSearch(e.target.value);
                        setShowTeacherDropdown(true);
                      }}
                      onFocus={() => setShowTeacherDropdown(true)}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400">
                      <i className={`fa ${teacherLoading ? 'fa-spinner fa-spin' : 'fa-chevron-down'} text-[10px]`}></i>
                    </div>

                    {showTeacherDropdown && (
                      <div ref={dropdownRef} className="absolute left-0 right-0 z-[100] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col" style={{ maxHeight: '300px' }}>
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                          {teachersList.length > 0 ? (
                            <ul className="divide-y divide-gray-50">
                              {teachersList.map((teacherItem, index) => (
                                <li
                                  key={teacherItem._id}
                                  ref={teachersList.length === index + 1 ? lastTeacherElementRef : null}
                                  className={`px-4 py-3 hover:bg-blue-50 cursor-pointer flex items-center justify-between ${teacher === teacherItem._id ? 'bg-blue-50' : ''}`}
                                  onClick={() => handleTeacherSelect(teacherItem._id, teacherItem.name)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold">
                                      {teacherItem.name?.charAt(0).toUpperCase()}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-700">{teacherItem.name}</p>
                                      <p className="text-[10px] text-gray-500">{teacherItem.email}</p>
                                    </div>
                                  </div>
                                  {teacher === teacherItem._id && <i className="fa fa-check-circle text-blue-500 text-sm"></i>}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="p-8 text-center text-xs text-gray-400 italic">No teachers found</div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {teacher && (
                    <div className="mt-2 flex items-center justify-between px-2 py-1 bg-blue-50 border border-blue-100 rounded-md">
                      <span className="text-[11px] text-blue-700 font-semibold">
                        <i className="fa fa-user-check mr-1"></i> {selectedTeacherName}
                      </span>
                      <button 
                        type="button" 
                        onClick={() => {
                          setCourse({...course, teacher: ""});
                          setTeacherSearch("");
                        }}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold"
                      >
                        REMOVE
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button type="button" onClick={() => navigate("/admin/courses")} className="px-4 py-2 text-xs font-semibold text-gray-400 hover:text-gray-600">{t('cancel')}</button>
              <button type="submit" disabled={isLoading} className={`px-8 py-2 rounded-lg text-xs font-bold text-white ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}>
                {isLoading ? t('updating') : t('Update Course')}
              </button>
            </div>
          </div>
        </form>
      </div>

      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmUpdate}
        isDeleteLoading={isLoading}
        message={t("Do you want to update this course?")}
        title={t("Update Course")}
        confirmText={t("Update")}
        cancelText={t("Cancel")}
      />
    </AdminLayout>
  );
};

export default UpdateCourse;