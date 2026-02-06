import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import {
  useCreateCourseMutation,
} from "../../redux/api/courseApi";
import { useGetUserByTypeQuery } from "../../redux/api/userApi";
import { useTranslation } from "react-i18next";

const NewCourse = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [course, setCourse] = useState({
    courseName: "",
    description: "",
    code: "",
    teacher: "",
  });

  // ✅ Infinite Scroll & Search States
  const [teacherSearch, setTeacherSearch] = useState("");
  const [showTeacherDropdown, setShowTeacherDropdown] = useState(false);
  const [page, setPage] = useState(1);
  const [teachersList, setTeachersList] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const dropdownRef = useRef(null);
  const inputRef = useRef(null);
  const observer = useRef();

  const { courseName, description, code, teacher } = course;

  const [createCourse, { isLoading, error, isSuccess }] = useCreateCourseMutation();

  // ✅ Teacher Fetch Query
  const {
    data: teachersData,
    isFetching: teacherLoading,
    error: teacherError,
  } = useGetUserByTypeQuery({
    type: "teacher",
    status: "active",
    page: page,
    limit: 10,
    keyword: teacherSearch
  }, {
    refetchOnMountOrArgChange: true,
    skip: !showTeacherDropdown && teacherSearch === "", // Only fetch when dropdown is open or searching
  });

  // ✅ Handle Infinite Scroll Observer
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

  // ✅ Sync list with teachersData correctly
  useEffect(() => {
    if (teachersData?.users) {
      if (page === 1 || teacherSearch) {
        // For first load or new search, replace the list
        setTeachersList(teachersData.users);
      } else {
        // For infinite scroll, append to the list
        setTeachersList(prev => {
          const combined = [...prev, ...teachersData.users];
          // Remove duplicates by ID
          const uniqueMap = new Map();
          combined.forEach(user => {
            uniqueMap.set(user._id, user);
          });
          return Array.from(uniqueMap.values());
        });
      }

      // Check for more data
      setHasMore(teachersData.users.length === 10);
    } else if (teachersData?.users === undefined && !teacherLoading) {
      // If no users data but not loading, set empty list
      setTeachersList([]);
      setHasMore(false);
    }
  }, [teachersData, page, teacherSearch, teacherLoading]);

  // ✅ Reset list and page on new search
  useEffect(() => {
    if (teacherSearch) {
      setPage(1);
      setHasMore(true);
    }
  }, [teacherSearch]);

  const selectedTeacherName = useMemo(() => {
    if (!teacher) return "";
    const foundTeacher = teachersList.find(t => t._id === teacher);
    return foundTeacher?.name || "";
  }, [teacher, teachersList]);

  // ✅ Handle click outside dropdown
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

  // ✅ Handle API responses and navigation
  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message || "Error creating course");
    }
    
    if (teacherError) {
      toast.error("Failed to load teachers");
    }
    
    if (isSuccess) {
      toast.success(t("Course Created"));
      navigate("/admin/courses", { 
        state: { 
          shouldRefetch: true,
          showSuccessToast: true 
        } 
      });
    }
  }, [error, isSuccess, navigate, t, teacherError]);

  const onChange = (e) => {
    setCourse({ ...course, [e.target.name]: e.target.value });
  };

  const handleTeacherSelect = (teacherId, teacherName) => {
    setCourse({ ...course, teacher: teacherId });
    setShowTeacherDropdown(false);
    setTeacherSearch(teacherName);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    
    // Validate required fields
    if (!courseName.trim()) {
      toast.error("Course name is required");
      return;
    }
    
    if (!code.trim() || code.length !== 8) {
      toast.error("Course code must be 8 characters");
      return;
    }
    
    if (!teacher) {
      toast.error("Please select a teacher");
      return;
    }
    
    createCourse(course);
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white placeholder:text-gray-400";
  const labelClass = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <AdminLayout>
      <MetaData title={t("New Course")} />

      <div className="max-w-6xl mx-auto py-4 px-4">
        <div className="flex items-center justify-between mb-4">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t('New Course')}</h1>
            <p className="text-xs text-gray-500">{t('Fill in details to create a new course')}</p>
          </div>
          <button
            onClick={() => navigate("/admin/courses")}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
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
                  <input 
                    type="text" 
                    name="courseName" 
                    value={courseName} 
                    onChange={onChange} 
                    className={inputClass} 
                    required 
                    placeholder="Enter course name"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('Description')}</label>
                  <textarea 
                    name="description" 
                    value={description} 
                    onChange={onChange} 
                    rows="3" 
                    className={`${inputClass} resize-none`}
                    placeholder="Enter course description (optional)"
                  ></textarea>
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
                  <input 
                    type="text" 
                    name="code" 
                    value={code} 
                    onChange={onChange} 
                    className={inputClass} 
                    maxLength={8} 
                    minLength={8} 
                    required 
                    placeholder="Enter 8-character code"
                    pattern="[A-Za-z0-9]{8}"
                    title="Must be exactly 8 alphanumeric characters"
                  />
                  <p className="text-xs text-gray-500 mt-1">Must be exactly 8 characters (letters/numbers)</p>
                </div>
                
                {/* Teacher Search Dropdown */}
                <div className="relative">
                  <label className={labelClass}>{t('Assigned Teacher')} *</label>
                  <div className="relative">
                    <input
                      ref={inputRef}
                      type="text"
                      className={`${inputClass} pr-10 cursor-pointer`}
                      placeholder="Click to search teacher..."
                      value={teacherSearch}
                      onChange={(e) => {
                        setTeacherSearch(e.target.value);
                        setShowTeacherDropdown(true);
                        setPage(1); // Reset to first page on new search
                      }}
                      onFocus={() => setShowTeacherDropdown(true)}
                      onClick={() => setShowTeacherDropdown(true)}
                      required
                      readOnly={!!teacher} // Make readonly when teacher is selected
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                      <i className={`fa ${teacherLoading ? 'fa-spinner fa-spin' : 'fa-chevron-down'} text-[10px]`}></i>
                    </div>

                    {showTeacherDropdown && (
                      <div 
                        ref={dropdownRef}
                        className="absolute left-0 right-0 z-[100] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                        style={{ maxHeight: '300px' }}
                      >
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                          {teachersList.length > 0 ? (
                            <ul className="divide-y divide-gray-50">
                              {teachersList.map((teacherItem, index) => (
                                <li
                                  key={`${teacherItem._id}-${index}`}
                                  ref={teachersList.length === index + 1 ? lastTeacherElementRef : null}
                                  className={`px-4 py-3 hover:bg-blue-50 cursor-pointer transition-all flex items-center justify-between ${teacher === teacherItem._id ? 'bg-blue-50' : ''}`}
                                  onClick={() => handleTeacherSelect(teacherItem._id, teacherItem.name)}
                                >
                                  <div className="flex items-center gap-3">
                                    <div className="w-8 h-8 rounded-full bg-blue-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                      {teacherItem.name?.charAt(0).toUpperCase() || 'T'}
                                    </div>
                                    <div>
                                      <p className="text-sm font-semibold text-gray-700 leading-tight">{teacherItem.name}</p>
                                      <p className="text-[10px] text-gray-500">{teacherItem.email || 'No email'}</p>
                                    </div>
                                  </div>
                                  {teacher === teacherItem._id && <i className="fa fa-check-circle text-blue-500 text-sm"></i>}
                                </li>
                              ))}
                            </ul>
                          ) : (
                            <div className="p-8 text-center">
                              {teacherLoading ? (
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-5 h-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                                  <p className="text-[11px] text-gray-500">Fetching teachers...</p>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 font-medium italic">
                                  {teacherSearch ? "No teachers found" : "Type to search teachers"}
                                </p>
                              )}
                            </div>
                          )}

                          {teacherLoading && teachersList.length > 0 && (
                            <div className="p-3 flex justify-center items-center gap-2 bg-gray-50/50 border-t border-gray-50">
                              <div className="w-3 h-3 border-2 border-blue-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-[10px] text-blue-600 font-semibold uppercase tracking-tighter">Loading more...</span>
                            </div>
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
                          setShowTeacherDropdown(false);
                        }}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold"
                      >
                        CLEAR
                      </button>
                    </div>
                  )}
                </div>
              </div>
            </div>

            <div className="px-5 py-4 bg-gray-50 border-t border-gray-200 flex justify-end gap-3">
              <button 
                type="button" 
                onClick={() => navigate("/admin/courses")} 
                className="px-4 py-2 text-xs font-semibold text-gray-600 bg-gray-100 hover:bg-gray-200 rounded-lg transition-all"
              >
                {t('Cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-8 py-2 rounded-lg text-xs font-bold text-white transition-all shadow-md hover:shadow-lg active:scale-95 ${isLoading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {isLoading ? (
                  <>
                    <i className="fa fa-spinner fa-spin mr-2"></i>
                    {t('Creating...')}
                  </>
                ) : (
                  <>
                    <i className="fa fa-plus mr-2"></i>
                    {t('Create Course')}
                  </>
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewCourse;