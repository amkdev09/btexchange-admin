import React, { useMemo, useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import {
  Card,
  CardContent,
  Typography,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Box,
  Button,
  TextField,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Chip,
  Dialog,
  DialogTitle,
  DialogContent,
  DialogActions,
  IconButton,
  TableSortLabel,
  CircularProgress,
} from "@mui/material";
import { useTheme } from "@mui/material/styles";
import CloseIcon from "@mui/icons-material/Close";
import DeleteIcon from "@mui/icons-material/Delete";
import VisibilityIcon from "@mui/icons-material/Visibility";
import BlockIcon from "@mui/icons-material/Block";
import adminService from "../../services/adminService";
import useSnackbar from "../../hooks/useSnackbar";

const ManageUsersPage = () => {
  const theme = useTheme();
  const navigate = useNavigate();
  const { showSnackbar } = useSnackbar();
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [sortBy, setSortBy] = useState("createdAt");
  const [sortDirection, setSortDirection] = useState("desc");
  const [page, setPage] = useState(1);
  const [pageSize] = useState(20);
  const [pagination, setPagination] = useState({
    total: 0,
    totalPages: 0,
  });
  const [selectedUser, setSelectedUser] = useState(null);
  const [updating, setUpdating] = useState(false);

  useEffect(() => {
    fetchUsers();
  }, [page, search, statusFilter, sortBy, sortDirection]);

  const fetchUsers = async () => {
    setLoading(true);
    try {
      const params = {
        page,
        limit: pageSize,
        sortBy,
        sortOrder: sortDirection,
        ...(search && { search }),
        ...(statusFilter !== "all" && {
          isBlocked: statusFilter === "blocked",
        }),
      };

      const response = await adminService.getUsers(params);

      if (response.success) {
        setUsers(response.data || []);
        setPagination(response.pagination || { total: 0, totalPages: 0 });
      }
    } catch (error) {
      console.error("Error fetching users:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to fetch users",
        "error"
      );
    } finally {
      setLoading(false);
    }
  };

  const handleSortChange = (key) => {
    if (sortBy === key) {
      setSortDirection((prev) => (prev === "asc" ? "desc" : "asc"));
    } else {
      setSortBy(key);
      setSortDirection("asc");
    }
  };

  const handleToggleStatus = async (userId, currentStatus) => {
    setUpdating(true);
    try {
      const newStatus = {
        isBlocked: !currentStatus,
      };

      const response = await adminService.updateUserStatus(userId, newStatus);

      if (response.success) {
        showSnackbar("User status updated successfully", "success");
        fetchUsers();
      }
    } catch (error) {
      console.error("Error updating user status:", error);
      showSnackbar(
        error.response?.data?.message || "Failed to update user status",
        "error"
      );
    } finally {
      setUpdating(false);
    }
  };

  const handleViewDetails = (user) => {
    if (user._id) {
      navigate(`/user-details/${user._id}`);
    } else if (user.UID || user.uid) {
      navigate(`/user-details/uid/${user.UID || user.uid}`);
    }
  };

  return (
    <Box sx={{ display: "flex", flexDirection: "column", gap: 3 }}>
      <Box sx={{ display: "flex", flexDirection: { xs: "column", sm: "row" }, alignItems: { sm: "center" }, justifyContent: { sm: "space-between" }, gap: 2 }}>
        <Box>
          <Typography variant="h5" sx={{ fontWeight: 600, color: theme.palette.text.primary, mb: 0.5 }}>
            Manage Users
          </Typography>
          <Typography variant="body2" sx={{ color: theme.palette.text.secondary }}>
            Search, filter and manage user accounts
          </Typography>
        </Box>
      </Box>

      {/* Filters */}
      <Box sx={{ display: "flex", flexDirection: { xs: "column", md: "row" }, alignItems: { md: "center" }, gap: 2 }}>
        <TextField
          size="small"
          placeholder="Search by name, email or UID"
          value={search}
          onChange={(e) => {
            setSearch(e.target.value);
            setPage(1);
          }}
          onKeyPress={(e) => {
            if (e.key === "Enter") {
              fetchUsers();
            }
          }}
          sx={{
            flex: 1,
            "& .MuiOutlinedInput-root": {
              "& fieldset": {
                borderColor: theme.palette.text.disabled,
              },
            },
          }}
        />
        <FormControl size="small" sx={{ minWidth: 120 }}>
          <InputLabel sx={{ color: theme.palette.text.secondary }}>Status</InputLabel>
          <Select
            value={statusFilter}
            onChange={(e) => {
              setStatusFilter(e.target.value);
              setPage(1);
            }}
            label="Status"
            sx={{
              color: theme.palette.text.primary,
              "& .MuiOutlinedInput-notchedOutline": {
                borderColor: theme.palette.text.disabled,
              },
            }}
          >
            <MenuItem value="all">All</MenuItem>
            <MenuItem value="active">Active</MenuItem>
            <MenuItem value="blocked">Blocked</MenuItem>
          </Select>
        </FormControl>
      </Box>

      {/* Table */}
      <Card>
        {loading ? (
          <Box sx={{ display: "flex", justifyContent: "center", py: 4 }}>
            <CircularProgress />
          </Box>
        ) : (
          <>
            <TableContainer>
              <Table size="small">
                <TableHead>
                  <TableRow>
                    <SortableTh
                      label="UID"
                      sortKey="uid"
                      sortBy={sortBy}
                      sortDirection={sortDirection}
                      onSort={handleSortChange}
                      align="left"
                    />
                    <SortableTh
                      label="User"
                      sortKey="name"
                      sortBy={sortBy}
                      sortDirection={sortDirection}
                      onSort={handleSortChange}
                      align="left"
                    />
                    <TableCell sx={{ fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 500, color: theme.palette.text.secondary }}>
                      Email
                    </TableCell>
                    <SortableTh
                      label="Status"
                      sortKey="isBlocked"
                      sortBy={sortBy}
                      sortDirection={sortDirection}
                      onSort={handleSortChange}
                      align="left"
                    />
                    <SortableTh
                      label="Created"
                      sortKey="createdAt"
                      sortBy={sortBy}
                      sortDirection={sortDirection}
                      onSort={handleSortChange}
                      align="left"
                    />
                    <TableCell align="right" sx={{ fontSize: "0.6875rem", textTransform: "uppercase", fontWeight: 500, color: theme.palette.text.secondary }}>
                      Actions
                    </TableCell>
                  </TableRow>
                </TableHead>
                <TableBody>
                  {users.length === 0 ? (
                    <TableRow>
                      <TableCell colSpan={6} align="center" sx={{ py: 3 }}>
                        <Typography variant="caption" sx={{ color: theme.palette.text.disabled }}>
                          No users found
                        </Typography>
                      </TableCell>
                    </TableRow>
                  ) : (
                    users.map((user) => (
                      <TableRow key={user._id || user.id} hover>
                        <TableCell>
                          <Typography variant="caption" sx={{ fontFamily: "monospace", color: theme.palette.text.secondary }}>
                            {user.UID || user.uid || user._id || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="body2" sx={{ fontWeight: 500 }}>
                            {user.fullName || user.name || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {user.email || "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell>
                          <Box sx={{ display: "flex", alignItems: "center", gap: 1 }}>
                            <Chip
                              label={user.isBlocked ? "Blocked" : "Active"}
                              size="small"
                              sx={{
                                fontSize: "0.6875rem",
                                height: 20,
                                fontWeight: 500,
                                bgcolor: user.isBlocked
                                  ? theme.palette.error.main + "1A"
                                  : theme.palette.success.main + "1A",
                                color: user.isBlocked
                                  ? theme.palette.error.main
                                  : theme.palette.success.main,
                              }}
                            />
                            <IconButton
                              size="small"
                              onClick={() => handleToggleStatus(user._id || user.id, user.isBlocked)}
                              disabled={updating}
                              sx={{ p: 0.5 }}
                            >
                              <BlockIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                        <TableCell>
                          <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                            {user.createdAt
                              ? new Date(user.createdAt).toLocaleDateString()
                              : "N/A"}
                          </Typography>
                        </TableCell>
                        <TableCell align="right">
                          <Box sx={{ display: "inline-flex", alignItems: "center", gap: 0.5 }}>
                            <IconButton
                              size="small"
                              onClick={() => handleViewDetails(user)}
                              sx={{
                                color: theme.palette.text.secondary,
                                "&:hover": {
                                  color: theme.palette.primary.main,
                                },
                              }}
                            >
                              <VisibilityIcon fontSize="small" />
                            </IconButton>
                          </Box>
                        </TableCell>
                      </TableRow>
                    ))
                  )}
                </TableBody>
              </Table>
            </TableContainer>

            {/* Pagination */}
            {pagination.totalPages > 1 && (
              <Box
                sx={{
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "space-between",
                  px: 1.5,
                  py: 1,
                  borderTop: `1px solid ${theme.palette.text.disabled}`,
                  bgcolor: theme.palette.secondary.light + "99",
                }}
              >
                <Typography variant="caption" sx={{ color: theme.palette.text.secondary }}>
                  Page {page} of {pagination.totalPages} · {pagination.total} users
                </Typography>
                <Box sx={{ display: "inline-flex", gap: 0.5 }}>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={page === 1}
                    onClick={() => setPage((p) => Math.max(1, p - 1))}
                    sx={{
                      fontSize: "0.6875rem",
                      minWidth: "auto",
                      px: 1,
                      py: 0.5,
                    }}
                  >
                    Previous
                  </Button>
                  <Button
                    size="small"
                    variant="outlined"
                    disabled={page === pagination.totalPages}
                    onClick={() => setPage((p) => Math.min(pagination.totalPages, p + 1))}
                    sx={{
                      fontSize: "0.6875rem",
                      minWidth: "auto",
                      px: 1,
                      py: 0.5,
                    }}
                  >
                    Next
                  </Button>
                </Box>
              </Box>
            )}
          </>
        )}
      </Card>

    </Box>
  );
};

const SortableTh = ({
  label,
  sortKey,
  sortBy,
  sortDirection,
  onSort,
  align = "left",
}) => {
  const theme = useTheme();
  const isActive = sortBy === sortKey;
  const direction = isActive ? sortDirection : undefined;

  return (
    <TableCell
      align={align}
      sx={{
        fontSize: "0.6875rem",
        textTransform: "uppercase",
        fontWeight: 500,
        color: theme.palette.text.secondary,
      }}
    >
      <TableSortLabel
        active={isActive}
        direction={direction}
        onClick={() => onSort(sortKey)}
        sx={{
          fontSize: "0.6875rem",
          color: theme.palette.text.secondary,
          "&:hover": {
            color: theme.palette.text.primary,
          },
          "&.Mui-active": {
            color: theme.palette.primary.main,
          },
          "& .MuiTableSortLabel-icon": {
            color: `${theme.palette.text.secondary} !important`,
          },
          "&.Mui-active .MuiTableSortLabel-icon": {
            color: `${theme.palette.primary.main} !important`,
          },
        }}
      >
        {label}
      </TableSortLabel>
    </TableCell>
  );
};

export default ManageUsersPage;