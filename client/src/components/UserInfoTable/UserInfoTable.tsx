import React, { useState, useEffect } from 'react';
import MediaQuery from 'react-responsive';
import EditIcon from '@material-ui/icons/EditOutlined';
import TrashIcon from '@material-ui/icons/DeleteOutlined';
import IconButton from '@material-ui/core/IconButton';
import Button from '@material-ui/core/Button';
import maleIcon from '@src/assets/male-icon.png';
import femaleIcon from '@src/assets/female-icon.png';
import { User } from '@src/context';
import { useModal, useToast, useUser } from '@src/hooks';
import { UserService } from '@src/services';
import UserForm from '@src/components/UserForm';
import Api from '@src/api';
import './UserInfoTable.scss';

interface UserInfoTableProps {
  user: User;
}

const UserInfoTable: React.FC<UserInfoTableProps> = ({ user }) => {
  const [isEditMode, setIsEditMode] = useState(false);
  const { closeModal, openModal } = useModal();
  const { openToast } = useToast();
  const { getUsers } = useUser();

  const source = Api.source();

  useEffect(() => {
    return () => {
      source.cancel();
    };
  }, [source]);

  const { address, firstName, gender, lastName, username, id: userId } = user;

  const toggleEditMode = (): void => {
    setIsEditMode(!isEditMode);
  };

  const deleteUser = async (id: string): Promise<void> => {
    try {
      await UserService.deleteUser(id, source);
      await getUsers();
      openToast({ variant: 'success', message: 'User successfully deleted.' });
    } catch (err) {
      if (!Api.isCancel(err)) {
        openToast({ variant: 'error', message: 'There was an error deleting the user.' });
      }
    }
  };

  const openDeleteModal = (): void => {
    openModal({
      title: 'Are you sure?',
      message: 'You are about to delete a user. This action cannot be undone.',
      action: async (): Promise<void> => {
        await deleteUser(userId);
        closeModal();
      }
    });
  };

  return !isEditMode ? (
    <div className="table-entry">
      <MediaQuery query="(min-width: 36.25rem)">
        <img
          className="user-icon"
          alt="User Icon"
          src={gender === 'male' || gender === 'other' ? maleIcon : femaleIcon}
        />
      </MediaQuery>
      <table className="user-info">
        <tbody>
          <tr>
            <th colSpan={2}>
              {firstName} {lastName}
            </th>
          </tr>
          <tr>
            <td>Username</td>
            <td>{username}</td>
          </tr>
          <tr>
            <td>ID #</td>
            <td>{userId}</td>
          </tr>
          <tr>
            <td>Gender</td>
            <td>{gender.charAt(0).toUpperCase() + gender.slice(1)}</td>
          </tr>
          <tr>
            <td>Address</td>
            <td>{address}</td>
          </tr>
        </tbody>
      </table>
      <div className="actions">
        <IconButton
          onClick={openDeleteModal}
          color="inherit"
          classes={{ colorInherit: 'delete-icon' }}
        >
          <TrashIcon />
        </IconButton>
        <IconButton
          onClick={toggleEditMode}
          color="inherit"
          classes={{ colorInherit: 'edit-icon' }}
        >
          <EditIcon />
        </IconButton>
      </div>
    </div>
  ) : (
    <div className="update-user-form">
      <UserForm variant="update" initialValues={user} callback={toggleEditMode} />
      <Button
        onClick={toggleEditMode}
        color="secondary"
        variant="outlined"
        className="cancel-button"
      >
        Cancel
      </Button>
    </div>
  );
};

export default UserInfoTable;