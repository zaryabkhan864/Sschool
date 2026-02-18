import React, { useEffect, useState, useRef, useCallback, useMemo } from "react";
import { useCountries } from "react-countries";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";
import { useRegisterMutation } from "../../redux/api/authApi";
import { useGetUserByTypeQuery } from "../../redux/api/userApi";
import MetaData from "../layout/MetaData";
import { useTranslation } from "react-i18next";
import PhoneInput from "react-phone-input-2";
import "react-phone-input-2/lib/style.css";
import { useGetGradesQuery } from "../../redux/api/gradesApi";
import AdminLayout from "../GUI/AdminLayout";

const NewTeacher = () => {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const { countries } = useCountries();
  const { refetch } = useGetUserByTypeQuery({ type: 'teacher' });

  // ✅ Grade Search & Infinite Scroll States
  const [gradeSearch, setGradeSearch] = useState("");
  const [showGradeDropdown, setShowGradeDropdown] = useState(false);
  const [gradePage, setGradePage] = useState(1);
  const [gradesList, setGradesList] = useState([]);
  const [hasMore, setHasMore] = useState(true);

  const gradeDropdownRef = useRef(null);
  const gradeInputRef = useRef(null);
  const gradeObserver = useRef();

  const [teacher, setTeacher] = useState({
    role: 'teacher',
    name: "",
    age: "",
    dateOfBirth: "",
    gender: "",
    passportNumber: "",
    nationality: "",
    phoneNumber: "",
    secondaryPhoneNumber: "",
    status: true,
    email: "",
    password: "",
    address: "",
    avatar: "",
  });

  const [avatarPreview, setAvatarPreview] = useState("");
  const { name, age, dateOfBirth, gender, passportNumber, nationality, phoneNumber, secondaryPhoneNumber, status, email, password, address } = teacher;

  const [register, { isLoading, error, isSuccess }] = useRegisterMutation();

  // ✅ Calculate age from date of birth
  const calculateAgeFromDOB = (dob) => {
    if (!dob) return "";
    const today = new Date();
    const birthDate = new Date(dob);
    let calculatedAge = today.getFullYear() - birthDate.getFullYear();
    const monthDiff = today.getMonth() - birthDate.getMonth();
    
    if (monthDiff < 0 || (monthDiff === 0 && today.getDate() < birthDate.getDate())) {
      calculatedAge--;
    }
    return calculatedAge.toString();
  };

  // ✅ Handle date of birth change
  const handleDateOfBirthChange = (e) => {
    const dob = e.target.value;
    setTeacher(prev => ({
      ...prev,
      dateOfBirth: dob,
      age: calculateAgeFromDOB(dob),
    }));
  };

  // ✅ Handle age change (manual override)
  const handleAgeChange = (e) => {
    setTeacher({ ...teacher, age: e.target.value });
  };

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

  // ✅ Get current date for max date (at least 18 years old for teachers)
  const getMaxDate = () => {
    const today = new Date();
    const maxDate = new Date(today.setFullYear(today.getFullYear() - 18));
    return maxDate.toISOString().split("T")[0];
  };

  // ✅ Get min date (70 years ago)
  const getMinDate = () => {
    const today = new Date();
    const minDate = new Date(today.setFullYear(today.getFullYear() - 70));
    return minDate.toISOString().split("T")[0];
  };

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

  useEffect(() => {
    if (error) toast.error(error?.data?.message);
    if (isSuccess) {
      toast.success(t("New Teacher Created"));
      navigate("/admin/teachers");
      refetch();
    }

    if (gradeError) {
      toast.error("Failed to load grades");
    }
  }, [error, isSuccess, navigate, refetch, t, gradeError]);

  const onChange = (e) => {
    const { name, value, type } = e.target;

    if (name === "avatar") {
      const file = e.target.files[0];
      if (!file) return;

      const reader = new FileReader();
      reader.onload = () => {
        if (reader.readyState === 2) {
          setAvatarPreview(reader.result);
          setTeacher({ ...teacher, avatar: reader.result });
        }
      };
      reader.readAsDataURL(file);
    }
    else if (name === "status") {
      setTeacher({ ...teacher, [name]: value === 'true' });
    }
    else if (name === "age") {
      handleAgeChange(e);
    }
    else {
      setTeacher({ ...teacher, [name]: value });
    }
  };

  const submitHandler = (e) => {
    e.preventDefault();

    // Validate required fields
    if (!name.trim()) {
      toast.error("Teacher name is required");
      return;
    }

    if (!email.trim()) {
      toast.error("Email is required");
      return;
    }

    if (!password.trim()) {
      toast.error("Password is required");
      return;
    }

    // Data ko properly format karein
    const teacherData = {
      ...teacher,
      phoneNumber: phoneNumber ? `+${phoneNumber}` : "",
      secondaryPhoneNumber: secondaryPhoneNumber ? `+${secondaryPhoneNumber}` : "",
      age: age || calculateAgeFromDOB(dateOfBirth),
    };

    register(teacherData);
  };

  const inputClass = "w-full px-3 py-2 text-sm border border-gray-200 rounded-lg focus:ring-2 focus:ring-blue-500/20 focus:border-blue-500 outline-none transition-all bg-white placeholder:text-gray-400";
  const labelClass = "block text-[11px] font-semibold text-gray-500 uppercase tracking-wider mb-1";

  return (
    <AdminLayout>
      <MetaData title={t("New Teacher")} />

      <div className="max-w-6xl mx-auto py-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-4 px-2">
          <div>
            <h1 className="text-xl font-bold text-gray-800">{t('New Teacher')}</h1>
            <p className="text-xs text-gray-500">{t('Onboard a new faculty member')}</p>
          </div>
          <button
            onClick={() => navigate("/admin/teachers")}
            className="px-3 py-1.5 text-xs font-medium text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 shadow-sm"
          >
            <i className="fa fa-arrow-left mr-1"></i> {t('back')}
          </button>
        </div>

        <form onSubmit={submitHandler} className="space-y-4">
          <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-visible">
            
            {/* Section 1: Credentials */}
            <div className="p-5 border-b border-gray-100">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa fa-lock text-blue-500 text-sm"></i>
                <h3 className="font-bold text-sm text-gray-800">{t('Account Credentials')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div>
                  <label className={labelClass}>{t('Full Name')} *</label>
                  <input type="text" name="name" value={name} onChange={onChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>{t('Email Address')} *</label>
                  <input type="email" name="email" value={email} onChange={onChange} className={inputClass} required />
                </div>
                <div>
                  <label className={labelClass}>{t('Password')} *</label>
                  <input type="password" name="password" value={password} onChange={onChange} className={inputClass} minLength="6" required />
                </div>
              </div>
            </div>

            {/* Section 2: Personal & Contact */}
            <div className="p-5 bg-gray-50/30">
              <div className="flex items-center gap-2 mb-4">
                <i className="fa fa-user text-green-500 text-sm"></i>
                <h3 className="font-bold text-sm text-gray-800">{t('Personal Information')}</h3>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <div>
                  <label className={labelClass}>{t('Gender')}</label>
                  <div className="flex items-center gap-4 mt-1">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="gender"
                        value="Male"
                        checked={gender === "Male"}
                        onChange={onChange}
                        className="w-3.5 h-3.5 text-blue-600"
                      />
                      <span className="text-xs text-gray-700">Male</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="gender"
                        value="Female"
                        checked={gender === "Female"}
                        onChange={onChange}
                        className="w-3.5 h-3.5 text-blue-600"
                      />
                      <span className="text-xs text-gray-700">Female</span>
                    </label>
            
                  </div>
                </div>
                <div>
                  <label className={labelClass}>{t('Date of Birth')} *</label>
                  <input 
                    type="date" 
                    name="dateOfBirth" 
                    value={dateOfBirth} 
                    onChange={handleDateOfBirthChange} 
                    className={inputClass} 
                    max={getMaxDate()}
                    min={getMinDate()}
                    required 
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("Must be at least 18 years old")}
                  </p>
                </div>
                <div>
                  <label className={labelClass}>{t('Age')}</label>
                  <input
                    type="number"
                    name="age"
                    value={age}
                    onChange={handleAgeChange}
                    className={inputClass}
                    min="18"
                    max="70"
                  />
                  <p className="text-xs text-gray-500 mt-1">
                    {t("Auto-calculated from date of birth")}
                  </p>
                </div>
                <div>
                  <label className={labelClass}>{t('Nationality')}</label>
                  <select name="nationality" value={nationality} onChange={onChange} className={inputClass}>
                    <option value="">Select Country</option>
                    {countries?.map(({ name }) => <option key={name} value={name}>{name}</option>)}
                  </select>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className={labelClass}>{t('Passport No')}</label>
                  <input
                    type="text"
                    name="passportNumber"
                    value={passportNumber}
                    onChange={onChange}
                    maxLength={14}
                    minLength={8}
                    pattern="[a-zA-z0-9]{8,14}"
                    className={inputClass}
                    onInvalid={(e) =>
                      e.target.setCustomValidity(
                        "Passport number must be 8 to 14 characters"
                      )
                    }
                    onInput={(e) => {
                      e.target.setCustomValidity("");
                    }}
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('Primary Contact')}</label>
                  <PhoneInput
                    country={"tr"}
                    value={phoneNumber}
                    onChange={(val) => setTeacher({...teacher, phoneNumber: val})}
                    isValid={(value, country) => {
                      if (country.countryCode === "tr") {
                        return value.length === 12;
                      }
                      return true;
                    }}
                    inputClass="!w-full !h-[38px] !text-sm !border-gray-200 !rounded-lg"
                    containerClass="!w-full"
                  />
                </div>
                <div>
                  <label className={labelClass}>{t('Secondary/Emergency Contact')}</label>
                  <PhoneInput
                    country={"tr"}
                    value={secondaryPhoneNumber}
                    onChange={(val) => setTeacher({...teacher, secondaryPhoneNumber: val})}
                    inputClass="!w-full !h-[38px] !text-sm !border-gray-200 !rounded-lg"
                    containerClass="!w-full"
                    dropdownClass="!z-50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mt-4">
                <div>
                  <label className={labelClass}>{t('Status')}</label>
                  <div className="flex items-center gap-4 mt-1">
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="status"
                        value={true}
                        checked={status === true || status === "true"}
                        onChange={onChange}
                        className="w-3.5 h-3.5 text-green-600"
                      />
                      <span className="text-xs text-gray-700">Active</span>
                    </label>
                    <label className="flex items-center gap-1.5">
                      <input
                        type="radio"
                        name="status"
                        value={false}
                        checked={status === false || status === "false"}
                        onChange={onChange}
                        className="w-3.5 h-3.5 text-red-600"
                      />
                      <span className="text-xs text-gray-700">Inactive</span>
                    </label>
                  </div>
                </div>

                {/* Empty divs for grid alignment */}
                <div></div>
                <div></div>
              </div>

              <div className="mt-4">
                <label className={labelClass}>{t('Residential Address')}</label>
                <textarea name="address" value={address} onChange={onChange} rows="2" className={`${inputClass} resize-none`}></textarea>
              </div>
            </div>

            {/* Section 3: Avatar */}
            <div className="p-5 border-t border-gray-100 flex items-center gap-4">
              <div className="relative">
                <div className="w-16 h-16 rounded-xl border-2 border-dashed border-gray-300 overflow-hidden bg-white flex items-center justify-center">
                  {avatarPreview ? (
                    <img src={avatarPreview} alt="Preview" className="w-full h-full object-cover" />
                  ) : (
                    <i className="fa fa-camera text-gray-300 text-xl"></i>
                  )}
                </div>
                <label htmlFor="avatar_field" className="absolute -bottom-1 -right-1 bg-blue-600 text-white w-6 h-6 rounded-md flex items-center justify-center cursor-pointer shadow-md">
                  <i className="fa fa-plus text-[10px]"></i>
                </label>
                <input type="file" id="avatar_field" accept="image/*" onChange={onChange} name="avatar" className="hidden" />
              </div>
              <div>
                <h4 className="text-xs font-bold text-gray-800">{t('Profile Picture')}</h4>
                <p className="text-[10px] text-gray-500">Max size 2MB (JPG/PNG)</p>
              </div>
            </div>

            {/* Actions */}
            <div className="px-5 py-3 bg-gray-50 border-t border-gray-200 flex justify-end gap-2">
              <button type="button" onClick={() => navigate("/admin/teachers")} className="px-4 py-2 text-xs font-medium text-gray-600 hover:underline">
                {t('cancel')}
              </button>
              <button
                type="submit"
                disabled={isLoading}
                className={`px-6 py-2 rounded-lg text-xs font-bold text-white transition-all ${isLoading ? "bg-gray-400" : "bg-blue-600 hover:bg-blue-700 shadow-md"}`}
              >
                {isLoading ? (
                  <>
                    <i className="fa fa-spinner fa-spin mr-1"></i> {t('creating')}
                  </>
                ) : (
                  t('Create Teacher')
                )}
              </button>
            </div>
          </div>
        </form>
      </div>
    </AdminLayout>
  );
};

export default NewTeacher;