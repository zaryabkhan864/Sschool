import React, { useEffect, useState, useMemo, useRef, useCallback } from "react";
import { useCountries } from "react-countries";
import toast from "react-hot-toast";
import { useNavigate, useParams } from "react-router-dom";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";

import {
  useGetUserByTypeQuery,
  useGetUserDetailsQuery,
  useUpdateUserMutation,
} from "../../redux/api/userApi";
import { useGetGradesQuery } from "../../redux/api/gradesApi";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import Loader from "../layout/Loader";

const UpdateStudent = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const params = useParams();
  const { countries } = useCountries();

  // ✅ Grade Search & Infinite Scroll States
  const [gradeSearch, setGradeSearch] = useState("");
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [gradePage, setGradePage] = useState(1);
  const [gradesList, setGradesList] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const gradeDropdownRef = useRef(null);
  const gradeInputRef = useRef(null);
  const gradeObserver = useRef();

  const [student, setStudent] = useState({
    role: "student",
    name: "",
    dateOfBirth: "",
    gender: "",
    nationality: "",
    passportNumber: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    address: "",
    grade: "",
    status: true,
    email: "",
    password: "",
    avatar: "",
    siblings: [],
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const {
    name,
    dateOfBirth,
    gender,
    nationality,
    passportNumber,
    phoneNumber,
    secondaryPhoneNumber,
    address,
    grade,
    status,
    email,
    password,
    siblings
  } = student;

  const { data: studentData, isLoading: detailsLoading, refetch: refetchDetails } =
    useGetUserDetailsQuery(params?.id);
  const [updateUser, { isLoading, error, isSuccess }] =
    useUpdateUserMutation();

  const { data: studentsData } = useGetUserByTypeQuery("student");
  const existingStudents = studentsData?.users || [];

  // ✅ Grade Fetch Query with Search & Pagination
  const {
    data: gradesData,
    isFetching: gradeLoading,
    error: gradeError,
  } = useGetGradesQuery({
    page: gradePage,
    limit: 10,
    keyword: gradeSearch
  }, {
    refetchOnMountOrArgChange: true,
    skip: !showGradeDropdown && gradeSearch === "",
  });

  // ✅ Handle Infinite Scroll Observer for Grades
  const lastGradeElementRef = useCallback(node => {
    if (gradeLoading) return;
    if (gradeObserver.current) gradeObserver.current.disconnect();

    gradeObserver.current = new IntersectionObserver(entries => {
      if (entries[0].isIntersecting && hasMore && !gradeLoading) {
        setGradePage(prevPage => prevPage + 1);
      }
    });

    if (node) gradeObserver.current.observe(node);
  }, [gradeLoading, hasMore]);

  // ✅ Sync gradesList with gradesData correctly
  useEffect(() => {
    if (gradesData?.grades || gradesData?.data?.grades) {
      const grades = gradesData.grades || gradesData.data.grades;

      if (gradePage === 1 || gradeSearch) {
        setGradesList(grades);
      } else {
        setGradesList(prev => {
          const combined = [...prev, ...grades];
          const uniqueMap = new Map();
          combined.forEach(gradeItem => {
            const id = gradeItem._id || gradeItem.id;
            uniqueMap.set(id, gradeItem);
          });
          return Array.from(uniqueMap.values());
        });
      }

      setHasMore(grades.length === 10);
    } else if (!gradeLoading) {
      setGradesList([]);
      setHasMore(false);
    }
  }, [gradesData, gradePage, gradeSearch, gradeLoading]);

  // ✅ Reset list and page on new search
  useEffect(() => {
    if (gradeSearch) {
      setGradePage(1);
      setHasMore(true);
    }
  }, [gradeSearch]);

  // ✅ Get selected grade name
  const selectedGradeName = useMemo(() => {
    if (!grade) return "";
    const foundGrade = gradesList.find(g => {
      const id = g._id || g.id;
      return id === grade;
    });
    return foundGrade?.gradeName || foundGrade?.name || `Grade ${foundGrade?.level || foundGrade?.grade}` || "";
  }, [grade, gradesList]);

  // ✅ Handle click outside grade dropdown
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (gradeDropdownRef.current && !gradeDropdownRef.current.contains(event.target) &&
        gradeInputRef.current && !gradeInputRef.current.contains(event.target)) {
        setShowGradeDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  // ✅ Load student data on component mount
  useEffect(() => {
    if (studentData?.user) {
      const userData = studentData.user;
      
      // Format dateOfBirth to YYYY-MM-DD
      let formattedDate = "";
      if (userData.dateOfBirth) {
        try {
          const dateObj = new Date(userData.dateOfBirth);
          if (!isNaN(dateObj.getTime())) {
            const year = dateObj.getFullYear();
            const month = String(dateObj.getMonth() + 1).padStart(2, '0');
            const day = String(dateObj.getDate()).padStart(2, '0');
            formattedDate = `${year}-${month}-${day}`;
          }
        } catch (error) {
          console.error("Error parsing date:", error);
        }
      }

      // Set initial grade search to current grade name
      const currentGrade = userData.grade;
      let gradeSearchValue = "";
      if (currentGrade?._id) {
        gradeSearchValue = currentGrade.gradeName || currentGrade.name || `Grade ${currentGrade.level || currentGrade.grade}`;
      }

      setGradeSearch(gradeSearchValue);

      setStudent({
        role: "student",
        name: userData.name || "",
        dateOfBirth: formattedDate,
        gender: userData.gender || "",
        nationality: userData.nationality || "",
        passportNumber: userData.passportNumber || "",
        phoneNumber: userData.phoneNumber || "",
        secondaryPhoneNumber: userData.secondaryPhoneNumber || "",
        address: userData.address || "",
        grade: currentGrade?._id || "",
        status: userData.status ?? true,
        email: userData.email || "",
        password: "",
        avatar: userData.avatar?.url || "",
        siblings: userData.siblings?.map(s => s._id) || [],
      });
      setAvatarPreview(userData.avatar?.url || "");
    }

    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success(t("Student Updated"));
      navigate("/admin/students");
      refetchDetails();
    }

    if (gradeError) {
      toast.error("Failed to load grades");
    }
  }, [studentData, error, isSuccess, navigate, refetchDetails, t, gradeError]);

  const onChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "avatar") {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setStudent({ ...student, avatar: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
    else if (name === "status") {
      setStudent({ ...student, [name]: value === 'true' });
    }
    else {
      setStudent({ ...student, [name]: value });
    }
  };

  // ✅ Grade selection handler
  const handleGradeSelect = (gradeId, gradeName) => {
    setStudent({ ...student, grade: gradeId });
    setShowGradeDropdown(false);
    setGradeSearch(gradeName);
  };

  // ✅ Siblings functions
  const addSibling = () => {
    setStudent(prev => ({ ...prev, siblings: [...prev.siblings, ""] }));
  };

  const removeSibling = (index) => {
    const updated = [...siblings];
    updated.splice(index, 1);
    setStudent(prev => ({ ...prev, siblings: updated }));
  };

  const updateSibling = (index, value) => {
    const updated = [...siblings];
    updated[index] = value;
    setStudent(prev => ({ ...prev, siblings: updated }));
  };

  const submitHandler = (e) => {
    e.preventDefault();

    if (!name.trim()) {
      toast.error("Student name is required");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!grade) {
      toast.error("Please select a grade");
      return;
    }

    // Format data for update
    const updateData = { ...student };
    
    // Format dateOfBirth to ISO string
    if (updateData.dateOfBirth) {
      try {
        const dateObj = new Date(updateData.dateOfBirth);
        updateData.dateOfBirth = new Date(
          dateObj.getFullYear(),
          dateObj.getMonth(),
          dateObj.getDate()
        ).toISOString();
      } catch (error) {
        console.error("Error formatting date:", error);
      }
    }
    
    // Don't send password if it's empty
    if (!updateData.password) {
      delete updateData.password;
    }
    
    // Don't send avatar if it's not changed (already a URL string)
    if (updateData.avatar && updateData.avatar.startsWith('http')) {
      delete updateData.avatar;
    }
    
    // Filter empty siblings
    updateData.siblings = updateData.siblings.filter(sib => sib !== "");
    
    updateUser({ id: params?.id, body: updateData });
  };

  if (detailsLoading) {
    return <Loader />;
  }

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white placeholder:text-gray-400";
  const labelClass = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <AdminLayout>
      <MetaData title={t("Update Student")} />

      <div className="max-w-6xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <h1 className="text-xl font-bold text-gray-800">
              {t("Update Student")}
            </h1>
            <p className="text-xs text-gray-500">
              {t("Update student information")}
            </p>
          </div>
          <button
            onClick={() => navigate("/admin/students")}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <i className="fa fa-arrow-left mr-1"></i> {t("back")}
          </button>
        </div>

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
            {/* Section 1: Credentials */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa fa-lock text-blue-500 text-sm"></i>
                <h3 className="font-bold text-sm text-gray-800">
                  {t("Account Credentials")}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t("Student Name")} *</label>
                  <input
                    type="text"
                    name="name"
                    value={name}
                    onChange={onChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("Email Address")} *</label>
                  <input
                    type="email"
                    name="email"
                    value={email}
                    onChange={onChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    {t("Password")} ({t("optional")})
                  </label>
                  <input
                    type="password"
                    name="password"
                    value={password}
                    onChange={onChange}
                    className={inputClass}
                    placeholder={t("Leave blank to keep current password")}
                    minLength={6}
                  />
                </div>
              </div>
            </div>

            {/* Section 2: Personal & Contact */}
            <div className="p-5 bg-gray-50/30">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa fa-user text-green-500 text-sm"></i>
                <h3 className="font-bold text-sm text-gray-800">
                  {t("Personal Information")}
                </h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>{t("Date of Birth")} *</label>
                  <input
                    type="date"
                    name="dateOfBirth"
                    value={dateOfBirth}
                    onChange={onChange}
                    className={inputClass}
                    required
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("Gender")}</label>
                  <select
                    name="gender"
                    value={gender}
                    onChange={onChange}
                    className={inputClass}
                  >
                    <option value="">Select</option>
                    <option value="Male">Male</option>
                    <option value="Female">Female</option>
                    <option value="Other">Other</option>
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t("Nationality")}</label>
                  <select
                    name="nationality"
                    value={nationality}
                    onChange={onChange}
                    className={inputClass}
                  >
                    <option value="">Select Country</option>
                    {countries?.map((country) => (
                      <option key={country.name} value={country.name}>
                        {country.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className={labelClass}>{t("Passport No")}</label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={passportNumber}
                    onChange={onChange}
                    className={inputClass}
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className={labelClass}>{t("Primary Contact")}</label>
                  <PhoneInput
                    country={"tr"}
                    value={phoneNumber}
                    onChange={(phone) => setStudent({ ...student, phoneNumber: phone })}
                    inputClass="!w-full !h-[38px] !text-sm !border-gray-200 !rounded-lg"
                    containerClass="!w-full"
                    dropdownClass="!z-50"
                  />
                </div>
                <div>
                  <label className={labelClass}>
                    {t("Secondary/Emergency Contact")}
                  </label>
                  <PhoneInput
                    country={"tr"}
                    value={secondaryPhoneNumber}
                    onChange={(phone) => setStudent({ ...student, secondaryPhoneNumber: phone })}
                    inputClass="!w-full !h-[38px] !text-sm !border-gray-200 !rounded-lg"
                    containerClass="!w-full"
                    dropdownClass="!z-50"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t("Status")}</label>
                  <select
                    name="status"
                    value={status.toString()}
                    onChange={onChange}
                    className={inputClass}
                  >
                    <option value="true">Active</option>
                    <option value="false">Inactive</option>
                  </select>
                </div>
              </div>

              {/* Grade Search Dropdown */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                <div className="relative">
                  <label className={labelClass}>{t("Grade")} *</label>
                  <div className="relative">
                    <input
                      ref={gradeInputRef}
                      type="text"
                      className={`${inputClass} pr-10 cursor-pointer`}
                      placeholder="Click to search grade..."
                      value={gradeSearch}
                      onChange={(e) => {
                        setGradeSearch(e.target.value);
                        setShowGradeDropdown(true);
                        setGradePage(1);
                      }}
                      onFocus={() => setShowGradeDropdown(true)}
                      onClick={() => setShowGradeDropdown(true)}
                      required
                      readOnly={!!grade}
                    />
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none text-gray-400">
                      <i className={`fa ${gradeLoading ? 'fa-spinner fa-spin' : 'fa-chevron-down'} text-[10px]`}></i>
                    </div>

                    {showGradeDropdown && (
                      <div
                        ref={gradeDropdownRef}
                        className="absolute left-0 right-0 z-[100] mt-1 bg-white border border-gray-200 rounded-xl shadow-2xl overflow-hidden flex flex-col"
                        style={{ maxHeight: '300px' }}
                      >
                        <div className="overflow-y-auto flex-1 custom-scrollbar">
                          {gradesList.length > 0 ? (
                            <ul className="divide-y divide-gray-50">
                              {gradesList.map((gradeItem, index) => {
                                const gradeId = gradeItem._id || gradeItem.id;
                                const gradeName = gradeItem.gradeName || gradeItem.name || `Grade ${gradeItem.level || gradeItem.grade}`;

                                return (
                                  <li
                                    key={`${gradeId}-${index}`}
                                    ref={gradesList.length === index + 1 ? lastGradeElementRef : null}
                                    className={`px-4 py-3 hover:bg-blue-50 cursor-pointer transition-all flex items-center justify-between ${grade === gradeId ? 'bg-blue-50' : ''}`}
                                    onClick={() => handleGradeSelect(gradeId, gradeName)}
                                  >
                                    <div className="flex items-center gap-3">
                                      <div className="w-8 h-8 rounded-full bg-green-600 flex items-center justify-center text-white text-[10px] font-bold shadow-sm">
                                        {gradeName?.charAt(0).toUpperCase() || 'G'}
                                      </div>
                                      <div>
                                        <p className="text-sm font-semibold text-gray-700 leading-tight">{gradeName}</p>
                                        {gradeItem.description && (
                                          <p className="text-[10px] text-gray-500 truncate max-w-[200px]">
                                            {gradeItem.description}
                                          </p>
                                        )}
                                      </div>
                                    </div>
                                    {grade === gradeId && <i className="fa fa-check-circle text-green-500 text-sm"></i>}
                                  </li>
                                );
                              })}
                            </ul>
                          ) : (
                            <div className="p-8 text-center">
                              {gradeLoading ? (
                                <div className="flex flex-col items-center gap-2">
                                  <div className="w-5 h-5 border-2 border-green-500 border-t-transparent rounded-full animate-spin"></div>
                                  <p className="text-[11px] text-gray-500">Fetching grades...</p>
                                </div>
                              ) : (
                                <p className="text-xs text-gray-400 font-medium italic">
                                  {gradeSearch ? "No grades found" : "Type to search grades"}
                                </p>
                              )}
                            </div>
                          )}

                          {gradeLoading && gradesList.length > 0 && (
                            <div className="p-3 flex justify-center items-center gap-2 bg-gray-50/50 border-t border-gray-50">
                              <div className="w-3 h-3 border-2 border-green-600 border-t-transparent rounded-full animate-spin"></div>
                              <span className="text-[10px] text-green-600 font-semibold uppercase tracking-tighter">Loading more...</span>
                            </div>
                          )}
                        </div>
                      </div>
                    )}
                  </div>
                  {grade && (
                    <div className="mt-2 flex items-center justify-between px-2 py-1 bg-green-50 border border-green-100 rounded-md">
                      <span className="text-[11px] text-green-700 font-semibold">
                        <i className="fa fa-check-circle mr-1"></i> {selectedGradeName}
                      </span>
                      <button
                        type="button"
                        onClick={() => {
                          setStudent({ ...student, grade: "" });
                          setGradeSearch("");
                          setShowGradeDropdown(false);
                        }}
                        className="text-[10px] text-red-500 hover:text-red-700 font-bold"
                      >
                        CLEAR
                      </button>
                    </div>
                  )}
                  {gradeError && (
                    <p className="text-xs text-red-500 mt-1">
                      Failed to load grades: {gradeError?.data?.message || "Please try again"}
                    </p>
                  )}
                </div>
              </div>

              <div className="mt-4">
                <label className={labelClass}>
                  {t("Residential Address")}
                </label>
                <textarea
                  name="address"
                  value={address}
                  onChange={onChange}
                  rows="2"
                  className={`${inputClass} resize-none`}
                ></textarea>
              </div>
            </div>

            {/* Section 3: Siblings */}
            <div className="p-5 border-t border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa fa-users text-purple-500 text-sm"></i>
                <h3 className="font-bold text-sm text-gray-800">{t('Siblings')}</h3>
              </div>

              <div className="space-y-3">
                {siblings.map((sibling, index) => (
                  <div key={index} className="flex items-center gap-3">
                    <div className="flex-1">
                      <select
                        className={inputClass}
                        value={sibling}
                        onChange={(e) => updateSibling(index, e.target.value)}
                      >
                        <option value="">Select a sibling</option>
                        {existingStudents?.filter(s => s._id !== params?.id).map((s) => (
                          <option key={s._id} value={s._id}>
                            {s.name} ({s.grade?.gradeName || s.grade?.name || 'No grade'})
                          </option>
                        ))}
                      </select>
                    </div>
                    <button
                      type="button"
                      onClick={() => removeSibling(index)}
                      className="px-3 py-2 text-xs font-medium text-white bg-red-500 hover:bg-red-600 rounded-lg shadow-sm transition-colors"
                    >
                      <i className="fa fa-trash mr-1"></i> Remove
                    </button>
                  </div>
                ))}

                <button
                  type="button"
                  onClick={addSibling}
                  className="px-4 py-2 text-xs font-medium text-blue-600 bg-blue-50 hover:bg-blue-100 border border-blue-200 rounded-lg transition-colors"
                >
                  <i className="fa fa-plus mr-1"></i> Add Sibling
                </button>
              </div>
            </div>

            {/* Section 4: Avatar */}
            <div className="p-5 border-t border-gray-100 flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-white flex items-center justify-center">
                  {avatarPreview ? (
                    <img
                      src={avatarPreview}
                      alt="Preview"
                      className="w-full h-full object-cover"
                    />
                  ) : (
                    <i className="fa fa-camera text-gray-300 text-xl"></i>
                  )}
                </div>
                <label
                  htmlFor="avatar_field"
                  className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-6 h-6 rounded-md flex items-center justify-center cursor-pointer shadow-md"
                >
                  <i className="fa fa-plus text-[10px]"></i>
                </label>
                <input
                  type="file"
                  id="avatar_field"
                  accept="image/*"
                  onChange={onChange}
                  name="avatar"
                  className="hidden"
                />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">
                  {t("Profile Picture")}
                </h4>
                <p className="text-[10px] text-gray-500">
                  Max size 2MB (JPG/PNG)
                </p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => navigate("/admin/students")}
                className="px-4 py-2 text-xs font-medium text-gray-600 hover:underline"
              >
                {t("cancel")}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg text-xs font-bold text-white transition-all ${
                  isLoading
                    ? "bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700 shadow-md"
                }`}
              >
                {isLoading ? (
                  <>
                    <i className="fa fa-spinner fa-spin mr-1"></i> {t("updating")}
                  </>
                ) : (
                  t("Update Student")
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default UpdateStudent;