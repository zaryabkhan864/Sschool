import React, { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUploadAvatarMutation } from "../../redux/api/authApi";
import toast from "react-hot-toast";
import { useSelector } from "react-redux";
import MetaData from "../layout/MetaData";
import UserLayout from "../GUI/UserLayout";
import AppPageHeader from "../layout/AppPageHeader";
import AppCard from "../GUI/AppCard";
import AppButton from "../GUI/AppButton";
import AvatarUpload from "../GUI/AvatarUpload";

const UploadAvatar = () => {
  const { user } = useSelector((state) => state.auth);

  const [avatar, setAvatar] = useState("");
  const [avatarPreview, setAvatarPreview] = useState(
    user?.avatar ? user?.avatar?.url : "/images/default_avatar.jpg"
  );

  const navigate = useNavigate();

  const [uploadAvatar, { isLoading, error, isSuccess }] =
    useUploadAvatarMutation();

  useEffect(() => {
    if (error) {
      toast.error(error?.data?.message);
    }

    if (isSuccess) {
      toast.success("Avatar Uploaded Successfully");
      navigate("/me/profile");
    }
  }, [error, isSuccess, navigate]);

  const onChange = (e) => {
    const reader = new FileReader();

    reader.onload = () => {
      if (reader.readyState === 2) {
        setAvatarPreview(reader.result);
        setAvatar(reader.result);
      }
    };

    reader.readAsDataURL(e.target.files[0]);
  };

  const submitHandler = (e) => {
    e.preventDefault();
    uploadAvatar({ avatar });
  };

  return (
    <UserLayout>
      <MetaData title={"Upload Avatar"} />

      <div className="max-w-4xl mx-auto">
        <AppPageHeader
          title="Upload Avatar"
          subtitle="Update your profile picture"
          backUrl="/me/profile"
        />

        <form onSubmit={submitHandler}>
          <AppCard
            title="Profile Picture"
            icon="fa-camera"
            footer={
              <div className="flex justify-end gap-2">
                <AppButton backUrl="/me/profile" />
                <AppButton
                  type="submit"
                  label="Upload"
                  loadingLabel="Uploading..."
                  isLoading={isLoading}
                  icon="fa-upload"
                />
              </div>
            }
          >
            <AvatarUpload
              preview={avatarPreview}
              onChange={onChange}
              title="Choose a new avatar"
              subtitle="Max size 2MB"
            />
          </AppCard>
        </form>
      </div>
    </UserLayout>
  );
};

export default UploadAvatar;