import React, { useEffect, useState, useRef } from "react";
import { toast } from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useGetCoursesQuery } from "../../redux/api/courseApi";
import {
  useCreateGradeMutation,
} from "../../redux/api/gradesApi";  // ✅ 只导入需要的 hook
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";

// ✅ Separate CourseDropdown Component (保持不变)
const CourseDropdown = ({ 
  index, 
  selectedCourse, 
  onCourseSelect, 
  onClear,
  isRequired = true 
}) => {
  const { t } = useTranslation();
  const [search, setSearch] = useState("");
  const [showDropdown, setShowDropdown] = useState(false);
  const [filteredCourses, setFilteredCourses] = useState([]);
  
  const dropdownRef = useRef(null);
  const inputRef = useRef(null);

  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [isFetchingMore, setIsFetchingMore] = useState(false);
  const [allCourses, setAllCourses] = useState([]);

  const { data, isLoading, isFetching } = useGetCoursesQuery(
    { page, limit: 20 },
    { 
      skip: !showDropdown,
      refetchOnMountOrArgChange: false
    }
  );

  useEffect(() => {
    if (data?.courses) {
      if (page === 1) {
        setAllCourses(data.courses);
      } else {
        setAllCourses(prev => [...prev, ...data.courses]);
      }
      if (data.courses.length < 20) {
        setHasMore(false);
      }
    }
  }, [data, page]);

  useEffect(() => {
    if (!search.trim()) {
      setFilteredCourses(allCourses);
    } else {
      const searchLower = search.toLowerCase();
      const filtered = allCourses.filter(course => 
        course.courseName?.toLowerCase().includes(searchLower) ||
        course.code?.toLowerCase().includes(searchLower) ||
        course.description?.toLowerCase().includes(searchLower) ||
        course.teacher?.name?.toLowerCase().includes(searchLower)
      );
      setFilteredCourses(filtered);
    }
  }, [search, allCourses]);

  const handleScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    if (scrollHeight - scrollTop <= clientHeight * 1.2 && 
        hasMore && !isFetchingMore && !isLoading && !isFetching) {
      setIsFetchingMore(true);
      setTimeout(() => {
        setPage(prev => prev + 1);
        setIsFetchingMore(false);
      }, 500);
    }
  };

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target) &&
          inputRef.current && !inputRef.current.contains(event.target)) {
        setShowDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleSearchChange = (e) => {
    setSearch(e.target.value);
    if (!showDropdown) {
      setShowDropdown(true);
      setPage(1);
      setHasMore(true);
    }
  };

  const handleSelect = (course) => {
    onCourseSelect(course);
    setShowDropdown(false);
    setSearch(course.courseName);
  };

  const handleInputFocus = () => {
    if (!showDropdown) {
      setShowDropdown(true);
      setPage(1);
      setHasMore(true);
    }
  };

  const handleClear = () => {
    setSearch("");
    onClear();
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white placeholder:text-gray-400";
  const labelClass = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <div className="relative">
      <label className={labelClass}>
        {t('Course')} {index + 1} {isRequired && "*"}
      </label>
      <div className="relative">
        <input
          ref={inputRef}
          type="text"
          className={`${inputClass} pr-10 cursor-pointer`}
          placeholder="Type to search course..."
          value={search || selectedCourse?.courseName || ""}
          onChange={handleSearchChange}
          onFocus={handleInputFocus}
          required={isRequired}
        />
        <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
          <i className={`fa ${isLoading ? 'fa-spinner fa-spin' : 'fa-chevron-down'} text-[10px]`}></i>
        </div>

        {showDropdown && (
          <div 
            ref={dropdownRef}
            className="absolute left-0 right-0 z-[9999] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl flex flex-col"
            style={{ 
              maxHeight: '250px',
              top: '100%',
              boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.1), 0 8px 10px -6px rgba(0, 0, 0, 0.1)'
            }}
          >
            <div 
              className="overflow-y-auto flex-1"
              onScroll={handleScroll}
              style={{ 
                scrollbarWidth: 'thin',
                scrollbarColor: '#cbd5e1 #f8fafc'
              }}
            >
              {filteredCourses.length > 0 ? (
                <>
                  <ul className="divide-y divide-gray-50">
                    {filteredCourses.map((courseItem, itemIndex) => (
                      <li
                        key={`${courseItem._id}-${itemIndex}`}
                        className={`px-4 py-3 hover:bg-blue-50 cursor-pointer transition-all flex items-center justify-between ${selectedCourse?._id === courseItem._id ? 'bg-blue-50' : ''}`}
                        onClick={() => handleSelect(courseItem)}
                      >
                        <div className="flex items-center gap-3">
                          <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                            {courseItem.courseName?.charAt(0).toUpperCase() || 'C'}
                          </div>
                          <div>
                            <p className="text-sm font-semibold text-gray-700 leading-tight">
                              {courseItem.courseName}
                            </p>
                            <p className="text-[10px] text-gray-500">
                              Code: {courseItem.code} 
                              {courseItem.teacher && ` | Teacher: ${courseItem.teacher.name}`}
                            </p>
                          </div>
                        </div>
                        {selectedCourse?._id === courseItem._id && (
                          <i className="fa fa-check-circle text-green-500 text-sm"></i>
                        )}
                      </li>
                    ))}
                  </ul>
                  {(isFetchingMore || (isFetching && page > 1)) && (
                    <div className="py-4 text-center">
                      <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin inline-block"></div>
                    </div>
                  )}
                </>
              ) : (
                <div className="p-8 text-center">
                  <p className="text-xs text-gray-400 italic">No courses found</p>
                </div>
              )}
            </div>
          </div>
        )}
      </div>
      
      {selectedCourse?._id && (
        <div className="mt-2 flex items-center justify-between px-2 py-1 bg-green-50 border border-green-100 rounded-md">
          <span className="text-[11px] text-green-700 font-semibold">
            <i className="fa fa-book mr-1"></i> 
            {selectedCourse.courseName} ({selectedCourse.code})
          </span>
          <button type="button" onClick={handleClear} className="text-[10px] text-red-500 hover:text-red-700 font-bold">
            CLEAR
          </button>
        </div>
      )}
    </div>
  );
};

// ✅ Main NewGrade Component
const NewGrade = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();

  const [grade, setGrade] = useState({
    gradeName: "",
    description: "",
    courses: [],
  });

  const { gradeName, description } = grade;
  const [createGrade, { isLoading: isCreating, error, isSuccess }] = useCreateGradeMutation();

  useEffect(() => {
    if (error) toast.error(error?.data?.message);
    if (isSuccess) {
      toast.success(t("Grade Created Successfully"));
      navigate("/admin/grades");
      // ✅ 不需要手动 refetch，缓存标签会自动处理
    }
  }, [error, isSuccess, navigate, t]);

  const onChange = (e) => {
    setGrade({ ...grade, [e.target.name]: e.target.value });
  };

  const addCourse = () => {
    setGrade({ ...grade, courses: [...grade.courses, null] });
  };

  const updateCourse = (index, courseObj) => {
    const updatedCourses = [...grade.courses];
    updatedCourses[index] = courseObj;
    setGrade({ ...grade, courses: updatedCourses });
  };

  const removeCourse = (index) => {
    const updatedCourses = [...grade.courses];
    updatedCourses.splice(index, 1);
    setGrade({ ...grade, courses: updatedCourses });
  };

  const submitHandler = (e) => {
    e.preventDefault();
    const courseIds = grade.courses.filter(c => c !== null && c._id).map(c => c._id);
    if (courseIds.length === 0) {
      toast.error("Please add at least one course");
      return;
    }
    createGrade({ gradeName, description, courses: courseIds });
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white placeholder:text-gray-400";
  const labelClass = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <AdminLayout>
      <MetaData title={t("Create New Grade")} />

      <div className="max-w-6xl mx-auto py-4">
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t('New Grade')}</h1>
            <p className="text-xs text-gray-500">{t('Create a new grade')}</p>
          </div>
          <button
            onClick={() => navigate("/admin/grades")}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <i className="fa fa-arrow-left mr-1"></i> {t('back')}
          </button>
        </div>

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
            
            {/* Grade Information */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa fa-graduation-cap text-blue-500 text-sm"></i>
                <h3 className="font-bold text-sm text-gray-800">{t('Grade Information')}</h3>
              </div>
              
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <label className={labelClass}>{t('Grade Name')} *</label>
                  <input type="text" name="gradeName" value={gradeName} onChange={onChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>{t('Description')}</label>
                  <textarea name="description" value={description} onChange={onChange} rows="4" className={`${inputClass} resize-none`}></textarea>
                </div>
              </div>
            </div>

            {/* Course Assignment */}
            <div className="p-5 bg-gray-50/30 overflow-visible relative">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa fa-book text-green-500 text-sm"></i>
                <h3 className="font-bold text-sm text-gray-800">{t('Course Assignment')}</h3>
              </div>
              
              <div className="space-y-3 overflow-visible">
                {grade.courses.map((course, index) => (
                  <div key={index} className="flex items-center gap-3 p-3 bg-white rounded-lg border border-gray-200 overflow-visible relative z-[10]">
                    <div className="flex-1">
                      <CourseDropdown
                        index={index}
                        selectedCourse={course}
                        onCourseSelect={(obj) => updateCourse(index, obj)}
                        onClear={() => updateCourse(index, null)}
                      />
                    </div>
                    {grade.courses.length > 1 && (
                      <button
                        type="button"
                        onClick={() => removeCourse(index)}
                        className="mt-5 px-3 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg transition-colors"
                      >
                        <i className="fa fa-trash mr-1"></i> {t('Remove')}
                      </button>
                    )}
                  </div>
                ))}
                
                <button
                  type="button"
                  onClick={addCourse}
                  className="flex items-center gap-2 px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 rounded-lg border border-blue-200 transition-colors"
                >
                  <i className="fa fa-plus"></i> {t('Add Course')}
                </button>
              </div>
            </div>

            {/* Footer Buttons */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2 rounded-b-xl">
              <button 
                type="button" 
                onClick={() => navigate("/admin/grades")} 
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:underline"
              >
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isCreating}
                className={`px-6 py-2 rounded-lg text-xs font-bold text-white transition-all ${isCreating ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 shadow-md"}`}
              >
                {isCreating ? t('creating') : t('Create Grade')}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewGrade;