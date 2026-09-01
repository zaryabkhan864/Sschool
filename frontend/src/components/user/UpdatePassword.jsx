import React, { useEffect, useState } from "react";
import { useUpdatePasswordMutation } from "../../redux/api/authApi";
import toast from "react-hot-toast";
import { useNavigate } from "react-router-dom";

import MetaData from "../layout/MetaData";
import UserLayout from "../GUI/UserLayout";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppInput from "../GUI/AppInput";
import AppButton from "../GUI/AppButton";

const UpdatePassword = () => {
  const [oldPassword, setOldPassword] = useState("");
  const [password, setPassword] = useState("");

  const navigate = useNavigate();

  const [updatePassword, { isLoading, error, isSuccess }] =
    useUpdatePasswordMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Password Updated Successfully");
      navigate("/me/profile");
    }
  }, [error, isSuccess, navigate]);

  const onChange = (e) => {
    const { name, value } = e.target;
    if (name === "oldPassword") setOldPassword(value);
    if (name === "password") setPassword(value);
  };

  const submitHandler = (e) => {
    e.preventDefault();

    updatePassword({
      oldPassword,
      password,
    });
  };

  return (
    <UserLayout>
      <MetaData title={"Update Password"} />

      <div className="max-w-4xl mx-auto">
        <AppPageHeader
          title="Update Password"
          subtitle="Change your account password"
          backUrl="/me/profile"
        />

        <form onSubmit={submitHandler}>
          <AppCard
            title="Change Password"
            icon="fa-lock"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/me/profile" />
                <AppButton
                  type="submit"
                  label="Update Password"
                  loadingLabel="Updating..."
                  isLoading={isLoading}
                  icon="fa-key"
                />
              </div>
            }
          >
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <AppInput
                label="Old Password"
                type="password"
                name="oldPassword"
                value={oldPassword}
                onChange={onChange}
                required
                placeholder="Enter current password"
              />
              <AppInput
                label="New Password"
                type="password"
                name="password"
                value={password}
                onChange={onChange}
                required
                placeholder="Enter new password"
                minLength="6"
                helperText="Minimum 6 characters"
              />
            </div>
          </AppCard>
        </form>
      </div>
    </UserLayout>
  );
};

export default UpdatePassword;