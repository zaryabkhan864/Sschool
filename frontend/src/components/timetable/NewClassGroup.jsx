import React, { useEffect, useState } from "react";
import { toast } from "react-hot-toast";
import AdminLayout from "../layout/AdminLayout";
import MetaData from "../layout/MetaData";
import {
  useGetClassGroupsQuery,
  useCreateClassGroupMutation,
  useUpdateClassGroupMutation,
  useDeleteClassGroupMutation
} from "../../redux/api/classGroupApi";
import { useGetCampusQuery } from "../../redux/api/campusApi";
import { useGetAcademicLevelsQuery } from "../../redux/api/academicLevelApi";
import { useTranslation } from "react-i18next";
import { Table, Pagination } from "flowbite-react";
import ConfirmationModal from "../GUI/ConfirmationModal";
import { useGetGradesQuery } from "../../redux/api/gradesApi";

const NewClassGroup = () => {
  const { t } = useTranslation();

  // State for form
  const [classGroup, setClassGroup] = useState({
    grade: "",
    academicLevel: "",
    section: "",
    displayName: "",
    campus: "",
    year: new Date().getFullYear(),
    status: true,
  });

  // State for table
  const [searchTerm, setSearchTerm] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [itemsPerPage, setItemsPerPage] = useState(5);
  const [editMode, setEditMode] = useState(false);
  const [editId, setEditId] = useState(null);
  const [availableGrades, setAvailableGrades] = useState([]);

  // For delete confirmation modal
  const [showModal, setShowModal] = useState(false);
  const [selectedGroupId, setSelectedGroupId] = useState(null);

  // RTK Queries and Mutations
  const { data: groupsData, isLoading: groupsLoading, refetch: refetchGroups } = useGetClassGroupsQuery({
    paginate: "false"
  });

  const { data: campusesData, isLoading: campusesLoading } = useGetCampusQuery({
    paginate: "false"
  });

  const { data: academicLevelsData, isLoading: levelsLoading } = useGetAcademicLevelsQuery({
    paginate: "false"
  });

  const { data: gradesData, isLoading: gradesLoading, refetch: refetchGrades } = useGetGradesQuery({
    paginate: "false",
    campus: classGroup.campus || undefined,
    year: classGroup.year || undefined,
  });

  const [createClassGroup, { isLoading: createLoading, error: createError, isSuccess: createSuccess }] =
    useCreateClassGroupMutation();

  const [updateClassGroup, { isLoading: updateLoading, error: updateError, isSuccess: updateSuccess }] =
    useUpdateClassGroupMutation();

  const [deleteClassGroup, { isLoading: deleteLoading, error: deleteError, isSuccess: deleteSuccess }] =
    useDeleteClassGroupMutation();

  const { grade, academicLevel, section, displayName, campus, year, status } = classGroup;

  // Filter grades based on selected academic level
  useEffect(() => {
    if (academicLevel && gradesData?.grades) {
      // Ensure we're working with the correct data structure
      const gradesArray = Array.isArray(gradesData.grades)
        ? gradesData.grades
        : gradesData.grades?.grades || [];

      const filtered = gradesArray.filter(g => {
        if (!g) return false;

        // Check multiple possible structures for academicLevel
        const gradeLevelId =
          g.academicLevel?._id ||
          g.academicLevel ||
          g.academicLevelId;

        return gradeLevelId === academicLevel;
      });

      setAvailableGrades(filtered);
    } else {
      // If no academicLevel selected, show all grades for selected campus
      const gradesArray = Array.isArray(gradesData?.grades)
        ? gradesData.grades
        : gradesData?.grades?.grades || [];

      setAvailableGrades(gradesArray);
    }
  }, [academicLevel, gradesData]);

  // Auto-generate display name when grade and section change
  useEffect(() => {
    if (grade && section) {
      const selectedGrade = availableGrades.find(g =>
        g._id === grade || g?._id === grade
      );
      if (selectedGrade) {
        setClassGroup(prev => ({
          ...prev,
          displayName: `${selectedGrade.gradeName}${section}`
        }));
      }
    }
  }, [grade, section, availableGrades]);

  useEffect(() => {
    if (createError || updateError || deleteError) {
      const error = createError || updateError || deleteError;
      toast.error(error?.data?.message || "Something went wrong");
    }

    if (createSuccess) {
      toast.success("Class Group created successfully");
      resetForm();
      refetchGroups();
    }

    if (updateSuccess) {
      toast.success("Class Group updated successfully");
      resetForm();
      refetchGroups();
    }

    if (deleteSuccess) {
      toast.success("Class Group deleted successfully");
      refetchGroups();
      setShowModal(false);
      setSelectedGroupId(null);
    }
  }, [createError, updateError, deleteError, createSuccess, updateSuccess, deleteSuccess, refetchGroups]);

  // Campus select hone par grades ko refetch karein
  useEffect(() => {
    if (classGroup.campus) {
      refetchGrades();
    }
  }, [classGroup.campus, refetchGrades]);

  const onChange = (e) => {
    const { name, value, type, checked } = e.target;
    setClassGroup({
      ...classGroup,
      [name]: type === 'checkbox' ? checked : value
    });
  };

  const resetForm = () => {
    setClassGroup({
      grade: "",
      academicLevel: "",
      section: "",
      displayName: "",
      campus: "",
      year: new Date().getFullYear(),
      status: true,
    });
    setEditMode(false);
    setEditId(null);
    setAvailableGrades(gradesData?.grades || []);
  };

  const submitHandler = (e) => {
    e.preventDefault();

    const payload = {
      ...classGroup,
      year: parseInt(year)
    };

    if (editMode) {
      updateClassGroup({ id: editId, body: payload });
    } else {
      createClassGroup(payload);
    }
  };

  const handleEdit = (group) => {
    setClassGroup({
      grade: group.grade?._id || group.grade || "",
      academicLevel: group.academicLevel?._id || group.academicLevel || "",
      section: group.section || "",
      displayName: group.displayName || "",
      campus: group.campus?._id || group.campus || "",
      year: group.year?.toString() || new Date().getFullYear().toString(),
      status: group.status ?? true,
    });
    setEditMode(true);
    setEditId(group._id);

    // Scroll to form
    window.scrollTo({ top: 0, behavior: 'smooth' });
  };

  const handleDeleteClick = (id) => {
    setSelectedGroupId(id);
    setShowModal(true);
  };

  const confirmDelete = () => {
    if (selectedGroupId) {
      deleteClassGroup(selectedGroupId);
    }
  };

  // Helper function to get grade name
  const getGradeName = (grade) => {
    if (!grade) return "N/A";
    
    // Agar grade object hai (populated)
    if (typeof grade === 'object') {
      return grade.gradeName || grade.name || "N/A";
    }
    
    // Agar grade ID hai
    if (typeof grade === 'string') {
      if (!gradesData?.grades) return "N/A";
      const gradeItem = gradesData.grades.find(g => g._id === grade);
      return gradeItem ? gradeItem.gradeName : "N/A";
    }
    
    return "N/A";
  };

  // Filter and paginate the class groups
  const filteredGroups = groupsData?.classGroups?.filter(group => {
    if (!group) return false;
    const groupDisplayName = group?.displayName?.toLowerCase() || "";
    const groupSection = group?.section?.toLowerCase() || "";
    const search = searchTerm.toLowerCase();

    return groupDisplayName.includes(search) || groupSection.includes(search);
  }) || [];

  const totalPages = Math.ceil(filteredGroups.length / itemsPerPage);
  const paginatedGroups = filteredGroups.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  // Helper functions to get names from IDs
  const getCampusName = (campusId) => {
    if (!campusesData?.campus || !campusId) return "N/A";
    const campusItem = campusesData.campus.find(c => c._id === campusId);
    return campusItem ? campusItem.name : "N/A";
  };

  const getAcademicLevelName = (levelId) => {
    if (!academicLevelsData?.levels || !levelId) return "N/A";
    const levelItem = academicLevelsData.levels.find(l => l._id === levelId);
    return levelItem ? levelItem.name : "N/A";
  };

  // Get academic levels for selected campus
  const getCampusAcademicLevels = () => {
    if (!campus || !academicLevelsData?.levels) return [];

    return academicLevelsData.levels.filter(level => {
      if (!level) return false;

      // Handle both populated and unpopulated campus
      const levelCampusId = level.campus?._id || level.campus;
      return levelCampusId === campus;
    });
  };

  // Safely get the level name for display
  const getLevelName = (level) => {
    if (!level) return "N/A";

    if (typeof level === 'object') {
      return level.name || "N/A";
    }

    // If it's just an ID, use the helper function
    return getAcademicLevelName(level);
  };

  const isLoading = campusesLoading || levelsLoading || gradesLoading;

  if (isLoading) {
    return (
      <AdminLayout>
        <div className="flex justify-center items-center h-64">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
        </div>
      </AdminLayout>
    );
  }

  return (
    <AdminLayout>
      <MetaData title={editMode ? "Edit Class Group" : "Create New Class Group"} />

      {/* Form Section */}
      <div className="flex justify-center items-center pt-5">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">
            {editMode ? "Edit Class Group" : "Create New Class Group"}
          </h2>
          <form onSubmit={submitHandler}>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
              <div className="mb-4">
                <label htmlFor="campus_field" className="block text-sm font-medium text-gray-700">
                  {t("Campus")} *
                </label>
                <select
                  id="campus_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="campus"
                  value={campus}
                  onChange={onChange}
                  required
                >
                  <option value="">Select Campus</option>
                  {campusesData?.campus?.map(campusItem => (
                    <option key={campusItem._id} value={campusItem._id}>
                      {campusItem.name}
                    </option>
                  ))}
                </select>
              </div>

              <div className="mb-4">
                <label htmlFor="academicLevel_field" className="block text-sm font-medium text-gray-700">
                  Academic Level *
                </label>
                <select
                  id="academicLevel_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="academicLevel"
                  value={academicLevel}
                  onChange={onChange}
                  required
                  disabled={!campus}
                >
                  <option value="">Select Academic Level</option>
                  {getCampusAcademicLevels().map(level => (
                    <option key={level._id} value={level._id}>
                      {level.name}
                    </option>
                  ))}
                </select>
                {!campus && (
                  <p className="text-xs text-red-500 mt-1">Please select a campus first</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="grade_field" className="block text-sm font-medium text-gray-700">
                  Grade *
                </label>
                <select
                  id="grade_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="grade"
                  value={grade}
                  onChange={onChange}
                  required
                  disabled={!academicLevel || availableGrades.length === 0}
                >
                  <option value="">Select Grade</option>
                  {availableGrades.map(gradeItem => (
                    <option key={gradeItem._id} value={gradeItem._id}>
                      {gradeItem.gradeName} {gradeItem.order ? `(Order: ${gradeItem.order})` : ''}
                    </option>
                  ))}
                </select>
                {!academicLevel && (
                  <p className="text-xs text-red-500 mt-1">Please select an academic level first</p>
                )}
                {academicLevel && availableGrades.length === 0 && (
                  <p className="text-xs text-yellow-500 mt-1">No grades found for this academic level</p>
                )}
              </div>

              <div className="mb-4">
                <label htmlFor="section_field" className="block text-sm font-medium text-gray-700">
                  Section *
                </label>
                <input
                  type="text"
                  id="section_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="section"
                  value={section}
                  onChange={onChange}
                  required
                  placeholder="A, B, ENG, etc."
                />
              </div>

              <div className="mb-4">
                <label htmlFor="displayName_field" className="block text-sm font-medium text-gray-700">
                  Display Name *
                </label>
                <input
                  type="text"
                  id="displayName_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="displayName"
                  value={displayName}
                  onChange={onChange}
                  required
                  readOnly
                />
                <p className="text-xs text-gray-500 mt-1">Auto-generated from grade and section</p>
              </div>

              <div className="mb-4">
                <label htmlFor="year_field" className="block text-sm font-medium text-gray-700">
                  {t("Year")} *
                </label>
                <input
                  type="number"
                  id="year_field"
                  className="mt-1 block w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  name="year"
                  value={year}
                  onChange={onChange}
                  required
                  min="2000"
                  max="2100"
                />
              </div>

              <div className="mb-4 flex items-center">
                <input
                  type="checkbox"
                  id="status_field"
                  className="h-5 w-5 text-blue-600 rounded focus:ring-blue-500"
                  name="status"
                  checked={status}
                  onChange={onChange}
                />
                <label htmlFor="status_field" className="ml-2 block text-sm font-medium text-gray-700">
                  {t("Active")}
                </label>
              </div>
            </div>

            <div className="flex space-x-3">
              <button
                type="submit"
                className={`px-6 py-2 text-white font-semibold rounded-md ${
                  createLoading || updateLoading
                    ? "bg-gray-400"
                    : "bg-blue-600 hover:bg-blue-700"
                } focus:outline-none focus:ring focus:ring-blue-300`}
                disabled={createLoading || updateLoading}
              >
                {createLoading || updateLoading ? (
                  <span className="flex items-center">
                    <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    {editMode ? "Updating..." : "Creating..."}
                  </span>
                ) : (
                  editMode ? "UPDATE" : "CREATE"
                )}
              </button>

              {editMode && (
                <button
                  type="button"
                  onClick={resetForm}
                  className="px-6 py-2 text-gray-700 bg-gray-200 hover:bg-gray-300 font-semibold rounded-md focus:outline-none focus:ring focus:ring-gray-300"
                >
                  CANCEL
                </button>
              )}
            </div>
          </form>
        </div>
      </div>

      {/* Table Section */}
      <div className="flex justify-center items-center pt-10 pb-10">
        <div className="w-full max-w-7xl">
          <h2 className="text-2xl font-semibold mb-6">
            {filteredGroups.length} Class Groups
          </h2>

          {/* Controls Section */}
          <div className="flex flex-col md:flex-row justify-between items-center mb-4">
            {/* Search Bar */}
            <input
              type="text"
              placeholder="Search by display name or section..."
              className="block w-full md:w-1/3 p-2 border border-gray-300 rounded-md shadow-sm focus:ring-blue-500 focus:border-blue-500"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
            />

            {/* Records per Page Dropdown */}
            <div className="flex items-center mt-2 md:mt-0">
              <label htmlFor="itemsPerPage" className="mr-2 text-sm font-medium">
                Entries per Page:
              </label>
              <select
                id="itemsPerPage"
                className="p-2 border border-gray-300 rounded-md focus:ring-blue-500 focus:border-blue-500"
                value={itemsPerPage}
                onChange={(e) => setItemsPerPage(Number(e.target.value))}
              >
                <option value={5}>5</option>
                <option value={10}>10</option>
                <option value={15}>15</option>
                <option value={20}>20</option>
              </select>
            </div>
          </div>

          {/* Class Groups Table */}
          <div className="overflow-x-auto">
            <Table hoverable={true} className="w-full">
              <Table.Head>
                <Table.HeadCell>#</Table.HeadCell>
                <Table.HeadCell>Display Name</Table.HeadCell>
                <Table.HeadCell>Grade</Table.HeadCell>
                <Table.HeadCell>Section</Table.HeadCell>
                <Table.HeadCell>Academic Level</Table.HeadCell>
                <Table.HeadCell>Campus</Table.HeadCell>
                <Table.HeadCell>Year</Table.HeadCell>
                <Table.HeadCell>Status</Table.HeadCell>
                <Table.HeadCell>Actions</Table.HeadCell>
              </Table.Head>
              <Table.Body className="divide-y">
                {groupsLoading ? (
                  <Table.Row>
                    <Table.Cell colSpan={9} className="text-center py-4">
                      <div className="flex justify-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                      </div>
                    </Table.Cell>
                  </Table.Row>
                ) : paginatedGroups.length === 0 ? (
                  <Table.Row>
                    <Table.Cell colSpan={9} className="text-center py-4">
                      No class groups found
                    </Table.Cell>
                  </Table.Row>
                ) : (
                  paginatedGroups.map((group, index) => (
                    <Table.Row key={group?._id} className="bg-white dark:bg-gray-800">
                      <Table.Cell>{(currentPage - 1) * itemsPerPage + index + 1}</Table.Cell>
                      <Table.Cell>
                        <span className="font-semibold">{group?.displayName || "N/A"}</span>
                      </Table.Cell>
                      <Table.Cell>{getGradeName(group?.grade)}</Table.Cell>
                      <Table.Cell>
                        <span className="bg-gray-100 text-gray-800 text-xs font-medium px-2.5 py-0.5 rounded">
                          {group?.section || "N/A"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>{getLevelName(group?.academicLevel)}</Table.Cell>
                      <Table.Cell>{group?.campus?.name || getCampusName(group?.campus)}</Table.Cell>
                      <Table.Cell>{group?.year || "N/A"}</Table.Cell>
                      <Table.Cell>
                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${
                          group?.status 
                            ? "bg-green-100 text-green-800" 
                            : "bg-red-100 text-red-800"
                        }`}>
                          {group?.status ? "Active" : "Inactive"}
                        </span>
                      </Table.Cell>
                      <Table.Cell>
                        <div className="flex space-x-2">
                          <button
                            onClick={() => handleEdit(group)}
                            className="px-3 py-1 text-blue-600 border border-blue-600 rounded hover:bg-blue-600 hover:text-white focus:outline-none"
                          >
                            <i className="fa fa-pencil"></i>
                          </button>
                          <button
                            onClick={() => handleDeleteClick(group?._id)}
                            disabled={deleteLoading}
                            className="px-3 py-1 text-red-600 border border-red-600 rounded hover:bg-red-600 hover:text-white focus:outline-none"
                          >
                            {deleteLoading && selectedGroupId === group?._id ? (
                              <i className="fa fa-spinner fa-spin"></i>
                            ) : (
                              <i className="fa fa-trash"></i>
                            )}
                          </button>
                        </div>
                      </Table.Cell>
                    </Table.Row>
                  ))
                )}
              </Table.Body>
            </Table>
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex justify-center mt-4">
              <Pagination
                currentPage={currentPage}
                layout="navigation"
                onPageChange={(page) => setCurrentPage(page)}
                showIcons={true}
                totalPages={totalPages}
              />
            </div>
          )}
        </div>
      </div>

      {/* Delete Confirmation Modal */}
      <ConfirmationModal
        showModal={showModal}
        setShowModal={setShowModal}
        confirmDelete={confirmDelete}
        isDeleteLoading={deleteLoading}
        message="Do you want to delete this class group? This action cannot be undone."
      />
    </AdminLayout>
  );
};

export default NewClassGroup;