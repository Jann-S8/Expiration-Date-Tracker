import React, { useEffect, useRef, useState } from "react";
import Sidebar from "./Sidebar";
import {
  Typography, TextField, Button, Dialog, DialogTitle, DialogContent, DialogActions,
  Table, TableBody, TableCell, TableContainer, TableHead, TableRow, Paper, IconButton
} from "@mui/material";
import DeleteIcon from "@mui/icons-material/Delete";
import EditIcon from "@mui/icons-material/Edit";
import "./UserManagement.css";
import axios from "axios";

function UserManagement({ currentUser }) {
  const [users, setUsers] = useState([]);
  const [openModalAdd, setOpenModalAdd] = useState(false);
  const [openModalEdit, setOpenModalEdit] = useState(false);
  const [openModalDelete, setOpenModalDelete] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [editFormData, setEditFormData] = useState({
    userid: "",
    name: "",
    email: "",
    role: "employee"
  });

  const useridRef = useRef();
  const nameRef = useRef();
  const emailRef = useRef();
  const roleRef = useRef();

  // Only allow admin access
  if (!currentUser || currentUser.role !== "admin") {
    return (
      <div className="inventory-container">
        <Sidebar />
        <main className="content">
          <Typography variant="h4" color="error" style={{ marginTop: 40 }}>Access Denied: Admins Only</Typography>
        </main>
      </div>
    );
  }

  useEffect(() => {
    fetchUsers();
  }, []);

  async function fetchUsers() {
    const res = await axios.get("http://localhost:1337/users");
    setUsers(res.data);
  }

  async function handleAddUser() {
    const newUser = {
      userid: Date.now(), // Simple unique id
      name: nameRef.current.value,
      email: emailRef.current.value,
      role: roleRef.current?.value || "employee"
    };
    if (!newUser.name || !newUser.email) {
      alert("Name and Email are required");
      return;
    }
    await axios.post("http://localhost:1337/users", newUser);
    fetchUsers();
    setOpenModalAdd(false);
  }

  const handleOpenEditModal = (user) => {
    setSelectedUser(user);
    setEditFormData({
      userid: user.userid,
      name: user.name,
      email: user.email,
      role: user.role
    });
    setOpenModalEdit(true);
  };

  async function handleEditUser() {
    await axios.put(`http://localhost:1337/users/${selectedUser.userid}`, editFormData);
    fetchUsers();
    setOpenModalEdit(false);
  }

  const handleOpenDeleteModal = (user) => {
    setSelectedUser(user);
    setOpenModalDelete(true);
  };

  async function handleDeleteUser() {
    await axios.delete(`http://localhost:1337/users/${selectedUser.userid}`);
    fetchUsers();
    setOpenModalDelete(false);
  }

  return (
    <div className="inventory-container">
      <Sidebar />
      <main className="content">
        <div className="inventory-header">
          <Typography variant="h4" className="inventory-title">User Management</Typography>
          <Button variant="contained" color="primary" onClick={() => setOpenModalAdd(true)} className="add-product-btn">
            Add User
          </Button>
        </div>
        <TableContainer component={Paper}>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell><strong>User ID</strong></TableCell>
                <TableCell><strong>Name</strong></TableCell>
                <TableCell><strong>Email</strong></TableCell>
                <TableCell><strong>Role</strong></TableCell>
                <TableCell><strong>Actions</strong></TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {users.length > 0 ? (
                users.map((user) => (
                  <TableRow key={user.userid}>
                    <TableCell>{user.userid}</TableCell>
                    <TableCell>{user.name}</TableCell>
                    <TableCell>{user.email}</TableCell>
                    <TableCell>{user.role}</TableCell>
                    <TableCell>
                      <IconButton color="primary" onClick={() => handleOpenEditModal(user)}>
                        <EditIcon />
                      </IconButton>
                      <IconButton color="error" onClick={() => handleOpenDeleteModal(user)}>
                        <DeleteIcon />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))
              ) : (
                <TableRow>
                  <TableCell colSpan={5} align="center">No users found</TableCell>
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        {/* Add User Dialog */}
        <Dialog open={openModalAdd} onClose={() => setOpenModalAdd(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Add New User</DialogTitle>
          <DialogContent>
            <TextField inputRef={nameRef} label="Name" variant="outlined" margin="normal" fullWidth required />
            <TextField inputRef={emailRef} label="Email" variant="outlined" margin="normal" fullWidth required />
            <TextField inputRef={roleRef} label="Role" variant="outlined" margin="normal" fullWidth defaultValue="employee" />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModalAdd(false)} variant="contained" color="error">Cancel</Button>
            <Button variant="contained" onClick={handleAddUser} color="primary">Add User</Button>
          </DialogActions>
        </Dialog>

        {/* Edit User Dialog */}
        <Dialog open={openModalEdit} onClose={() => setOpenModalEdit(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Edit User</DialogTitle>
          <DialogContent>
            <TextField name="userid" label="User ID" variant="outlined" margin="normal" fullWidth value={editFormData.userid} disabled />
            <TextField name="name" label="Name" variant="outlined" margin="normal" fullWidth value={editFormData.name} onChange={e => setEditFormData({ ...editFormData, name: e.target.value })} />
            <TextField name="email" label="Email" variant="outlined" margin="normal" fullWidth value={editFormData.email} onChange={e => setEditFormData({ ...editFormData, email: e.target.value })} />
            <TextField name="role" label="Role" variant="outlined" margin="normal" fullWidth value={editFormData.role} onChange={e => setEditFormData({ ...editFormData, role: e.target.value })} />
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModalEdit(false)} variant="contained" color="error">Cancel</Button>
            <Button variant="contained" onClick={handleEditUser} color="primary">Update User</Button>
          </DialogActions>
        </Dialog>

        {/* Delete User Dialog */}
        <Dialog open={openModalDelete} onClose={() => setOpenModalDelete(false)} maxWidth="sm" fullWidth>
          <DialogTitle>Delete Confirmation</DialogTitle>
          <DialogContent>
            <Typography>
              Are you sure you want to delete user <strong>{selectedUser?.name}</strong>?
            </Typography>
          </DialogContent>
          <DialogActions>
            <Button onClick={() => setOpenModalDelete(false)} variant="contained">Cancel</Button>
            <Button variant="contained" color="error" onClick={handleDeleteUser}>Delete</Button>
          </DialogActions>
        </Dialog>
      </main>
    </div>
  );
}

export default UserManagement;