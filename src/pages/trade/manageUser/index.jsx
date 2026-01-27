import React, { useState, useEffect } from 'react';
import {
  Box,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TablePagination,
  TableRow,
  TextField,
  IconButton,
  Chip,
  Typography,
  InputAdornment,
  Select,
  MenuItem,
  FormControl,
  InputLabel,
  Modal,
  Card,
  CardContent,
  Button,
  Grid,
  Divider,
  Avatar,
  Stack,
  Tooltip,
} from '@mui/material';
import {
  Search,
  Visibility,
  Block,
  Delete,
  Sort,
  ArrowUpward,
  ArrowDownward,
  Person,
  Close,
  Check,
  Restore,
} from '@mui/icons-material';
import { AppColors } from '../../../constant/appColors';
import useSnackbar from '../../../hooks/useSnackbar';
import tradeService from '../../../services/tradeService';
import BTLoader from '../../../components/Loader';

const ManageUsers = () => {
  const { showSnackbar } = useSnackbar();

  // Table state
  const [users, setUsers] = useState([]);
  const [loading, setLoading] = useState(false);
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(10);
  const [totalUsers, setTotalUsers] = useState(0);

  // Filter state
  const [search, setSearch] = useState('');
  const [debouncedSearch, setDebouncedSearch] = useState('');
  const [statusFilter, setStatusFilter] = useState('all');
  const [sortBy, setSortBy] = useState('createdAt');
  const [sortOrder, setSortOrder] = useState('desc');

  // Modal state
  const [selectedUser, setSelectedUser] = useState(null);
  const [userDetails, setUserDetails] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [modalLoading, setModalLoading] = useState(false);

  // Action state
  const [actionLoading, setActionLoading] = useState(false);

  // Fetch users
  const fetchUsers = async () => {
    try {
      setLoading(true);
      const params = {
        page: page + 1, // API uses 1-based indexing
        limit: rowsPerPage,
        search: debouncedSearch.trim(),
        sortBy,
        sortOrder,
      };

      // Add status filters
      if (statusFilter === 'blocked') {
        params.isBlocked = true;
      } else if (statusFilter === 'deleted') {
        params.isDeleted = true;
      } else if (statusFilter === 'active') {
        params.isBlocked = false;
        params.isDeleted = false;
      }

      const response = await tradeService.getUsers(params);
      if (response.success) {
        setUsers(response.data || []);
        setTotalUsers(response.pagination?.total || 0);
      } else {
        showSnackbar('Failed to fetch users', 'error');
      }
    } catch (error) {
      console.error('Error fetching users:', error);
      showSnackbar('Error fetching users', 'error');
    } finally {
      setLoading(false);
    }
  };

  // Fetch user details
  const fetchUserDetails = async (userId, userUID) => {
    try {
      setModalLoading(true);
      const params = userId ? { id: userId } : { uid: userUID };
      const response = await tradeService.getUserDetails(params);

      if (response.success) {
        // Check if the response data has user nested or is direct
        const userData = response.data.user || response.data;
        setUserDetails(userData);
      } else {
        showSnackbar('Failed to fetch user details', 'error');
      }
    } catch (error) {
      console.error('Error fetching user details:', error);
      showSnackbar('Error fetching user details', 'error');
    } finally {
      setModalLoading(false);
    }
  };

  // Update user status
  const updateUserStatus = async (userId, updates) => {
    try {
      setActionLoading(true);
      const response = await tradeService.updateUserStatus(userId, updates);

      if (response.success) {
        showSnackbar('User status updated successfully', 'success');
        fetchUsers(); // Refresh the list
        if (userDetails && userDetails._id === userId) {
          // Update user details in modal
          setUserDetails({
            ...userDetails,
            ...updates
          });
        }
      } else {
        showSnackbar('Failed to update user status', 'error');
      }
    } catch (error) {
      console.error('Error updating user status:', error);
      showSnackbar('Error updating user status', 'error');
    } finally {
      setActionLoading(false);
    }
  };

  // Handle view user details
  const handleViewUser = (user) => {
    setSelectedUser(user);
    setModalOpen(true);
    fetchUserDetails(user._id, user.UID);
  };

  // Handle modal close
  const handleModalClose = () => {
    setModalOpen(false);
    setSelectedUser(null);
    setUserDetails(null);
  };

  // Handle page change
  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  // Handle rows per page change
  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  // Handle header cell click for sorting
  const handleSort = (column) => {
    if (sortBy === column) {
      // Toggle sort order if clicking the same column
      setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
    } else {
      // Set new column and default to ascending
      setSortBy(column);
      setSortOrder('asc');
    }
    setPage(0); // Reset to first page when sorting changes
  };

  // Get sort icon for a column
  const getSortIcon = (column) => {
    if (sortBy !== column) {
      return <Sort sx={{ fontSize: 16, opacity: 0.3 }} />;
    }
    return sortOrder === 'asc' ? (
      <ArrowUpward sx={{ fontSize: 16, color: AppColors.GOLD_DARK }} />
    ) : (
      <ArrowDownward sx={{ fontSize: 16, color: AppColors.GOLD_DARK }} />
    );
  };

  // Get status chip
  const getStatusChip = (user) => {
    if (user.isDeleted) {
      return (
        <Chip
          label="Deleted"
          size="small"
          sx={{
            bgcolor: `${AppColors.ERROR}20`,
            color: AppColors.ERROR,
            fontWeight: 600,
          }}
        />
      );
    }
    if (user.isBlocked) {
      return (
        <Chip
          label="Blocked"
          size="small"
          sx={{
            bgcolor: `${AppColors.ERROR}30`,
            color: AppColors.ERROR,
            fontWeight: 600,
          }}
        />
      );
    }
    return (
      <Chip
        label={user.isEmailVerified ? "Active" : "Unverified"}
        size="small"
        sx={{
          bgcolor: user.isEmailVerified ? `${AppColors.SUCCESS}20` : `${AppColors.ERROR}15`,
          color: user.isEmailVerified ? AppColors.SUCCESS : AppColors.ERROR,
          fontWeight: 600,
        }}
      />
    );
  };

  // Debounce search effect
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(search);
    }, 500); // 500ms delay

    return () => {
      clearTimeout(timer);
    };
  }, [search]);

  // Effects
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, debouncedSearch, statusFilter, sortBy, sortOrder]);

  return (
    <Box>
      {/* MainHeader */}
      <Box sx={{ mb: { xs: 1, md: 2 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: AppColors.TXT_MAIN,
            background: `linear-gradient(45deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Manage Users
        </Typography>
      </Box>
      <Paper
        elevation={0}
        sx={{
          backgroundColor: AppColors.BG_CARD,
          border: `1px solid ${AppColors.BG_SECONDARY}`,
          borderRadius: 3,
          pt: { xs: 1, md: 2 },
        }}
      >
        <Grid container spacing={2} px={2} alignItems="center">
          {/* Search */}
          <Grid size={{ xs: 12, md: 4 }}>
            <TextField
              fullWidth
              placeholder="Search by email, name, or UID..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              InputProps={{
                startAdornment: (
                  <InputAdornment position="start">
                    <Search sx={{ color: AppColors.GOLD_DARK }} />
                  </InputAdornment>
                ),
                sx: {
                  backgroundColor: AppColors.BG_SECONDARY,
                  borderRadius: 2,
                  '& fieldset': { border: 'none' },
                  '& input': { color: AppColors.TXT_MAIN },
                  '& input::placeholder': { color: AppColors.TXT_SUB },
                },
              }}
              size="small"
            />
          </Grid>

          {/* Status Filter */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: AppColors.TXT_SUB }}>Status</InputLabel>
              <Select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                label="Status"
                sx={{
                  backgroundColor: AppColors.BG_SECONDARY,
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '& .MuiSelect-select': { color: AppColors.TXT_MAIN },
                }}
              >
                <MenuItem value="all">All Users</MenuItem>
                <MenuItem value="active">Active</MenuItem>
                <MenuItem value="blocked">Blocked</MenuItem>
                <MenuItem value="deleted">Deleted</MenuItem>
              </Select>
            </FormControl>
          </Grid>
        </Grid>
        <Box sx={{ mt: { xs: 1, md: 1.5 } }}>
          <TableContainer>
            <Table sx={{
              "& .MuiTableCell-root": {
                p: { xs: 1, md: 1.5 },
              },
              "& .MuiTableCell-head": {
                p: { xs: 1, md: 1.5 },
              },
              "& .MuiTableCell-body": {
                p: { xs: 1, md: 1.5 },
              },
            }}>
              <TableHead>
                <TableRow sx={{ backgroundColor: AppColors.BG_SECONDARY }}>
                  <TableCell
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontWeight: 600,
                      cursor: 'pointer',
                      userSelect: 'none',
                      '&:hover': {
                        backgroundColor: `${AppColors.GOLD_DARK}10`,
                      },
                    }}
                    onClick={() => handleSort('fullName')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Full Name
                      {getSortIcon('fullName')}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontWeight: 600,
                      cursor: 'pointer',
                      userSelect: 'none',
                      '&:hover': {
                        backgroundColor: `${AppColors.GOLD_DARK}10`,
                      },
                    }}
                    onClick={() => handleSort('email')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Email
                      {getSortIcon('email')}
                    </Box>
                  </TableCell>
                  <TableCell
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontWeight: 600,
                      cursor: 'pointer',
                      userSelect: 'none',
                      '&:hover': {
                        backgroundColor: `${AppColors.GOLD_DARK}10`,
                      },
                    }}
                    onClick={() => handleSort('UID')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      UID
                      {getSortIcon('UID')}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
                    Status
                  </TableCell>
                  <TableCell
                    sx={{
                      color: AppColors.TXT_MAIN,
                      fontWeight: 600,
                      cursor: 'pointer',
                      userSelect: 'none',
                      '&:hover': {
                        backgroundColor: `${AppColors.GOLD_DARK}10`,
                      },
                    }}
                    onClick={() => handleSort('createdAt')}
                  >
                    <Box sx={{ display: 'flex', alignItems: 'center', gap: 0.5 }}>
                      Created
                      {getSortIcon('createdAt')}
                    </Box>
                  </TableCell>
                  <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }} align="center">
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {loading ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: { xs: 1, md: 1.5 } }}>
                      <BTLoader />
                    </TableCell>
                  </TableRow>
                ) : users.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} align="center" sx={{ py: { xs: 1, md: 1.5 }, color: AppColors.TXT_SUB }}>
                      No users found
                    </TableCell>
                  </TableRow>
                ) : (
                  users.map((user) => (
                    <TableRow
                      key={user._id}
                      hover
                      sx={{
                        '&:hover': {
                          backgroundColor: `${AppColors.GOLD_DARK}05`,
                        },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: 'flex', alignItems: 'center', gap: 2 }}>
                          <Avatar
                            sx={{
                              bgcolor: AppColors.GOLD_DARK,
                              width: { xs: 25, md: 30 },
                              height: { xs: 25, md: 30 },
                            }}
                          >
                            {(user.fullName || user.email)?.[0]?.toUpperCase() || 'U'}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body2"
                              sx={{ color: AppColors.TXT_MAIN, fontWeight: 500 }}
                            >
                              {user.fullName || 'No Name'}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}
                        >
                          {user.email}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        <Typography
                          variant="body2"
                          sx={{ color: AppColors.GOLD_DARK, fontFamily: 'monospace', fontWeight: 600 }}
                        >
                          {user.UID}
                        </Typography>
                      </TableCell>
                      <TableCell>
                        {getStatusChip(user)}
                      </TableCell>
                      <TableCell>
                        <Typography variant="body2" sx={{ color: AppColors.TXT_SUB }}>
                          {new Date(user.createdAt).toLocaleDateString()}
                        </Typography>
                      </TableCell>
                      <TableCell align="center">
                        <Stack direction="row" spacing={1} justifyContent="center">
                          <Tooltip title="View Details">
                            <IconButton
                              size="small"
                              onClick={() => handleViewUser(user)}
                              sx={{
                                color: AppColors.GOLD_DARK,
                                '&:hover': {
                                  backgroundColor: `${AppColors.GOLD_DARK}20`,
                                },
                              }}
                            >
                              <Visibility fontSize="small" />
                            </IconButton>
                          </Tooltip>
                        </Stack>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </TableContainer>

          {/* Pagination */}
          <TablePagination
            component="div"
            count={totalUsers}
            page={page}
            onPageChange={handleChangePage}
            rowsPerPage={rowsPerPage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            rowsPerPageOptions={[5, 10, 25, 50]}
            sx={{
              borderTop: `1px solid ${AppColors.BG_SECONDARY}`,
              backgroundColor: AppColors.BG_CARD,
              '& .MuiTablePagination-toolbar': {
                color: AppColors.TXT_MAIN,
              },
              '& .MuiTablePagination-select': {
                color: AppColors.TXT_MAIN,
              },
              '& .MuiTablePagination-actions button': {
                color: AppColors.GOLD_DARK,
              },
            }}
          />
        </Box>
      </Paper>

      {/* User Details Modal */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: { xs: 1, md: 1.5 },
        }}
      >
        <Card
          sx={{
            backgroundColor: AppColors.BG_CARD,
            border: `1px solid ${AppColors.BG_SECONDARY}`,
            borderRadius: 3,
            maxWidth: { xs: '100%', md: 800 },
            width: '100%',
            maxHeight: '90vh',
            overflow: 'auto',
            boxShadow: '0 20px 40px rgba(0,0,0,0.3)',
          }}
        >
          <CardContent sx={{ p: { xs: 1, md: 1.5 } }}>
            {/* Modal MainHeader */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <Typography
                variant="h6"
                sx={{
                  color: AppColors.GOLD_DARK,
                  fontWeight: 700,
                }}
              >
                User Details
              </Typography>
              <IconButton
                onClick={handleModalClose}
                sx={{
                  color: AppColors.TXT_SUB,
                  '&:hover': {
                    backgroundColor: `${AppColors.ERROR}20`,
                    color: AppColors.ERROR,
                  },
                }}
              >
                <Close />
              </IconButton>
            </Box>

            {modalLoading ? (
              <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                <BTLoader />
              </Box>
            ) : userDetails ? (
              <>
                {/* User Info */}
                <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: AppColors.TXT_MAIN, fontWeight: 600, mb: { xs: 1, md: 1.5 } }}
                  >
                    Basic Information
                  </Typography>
                  <Grid container spacing={{ xs: 1, md: 1.5 }}>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <UserInfoItem
                        label="Name"
                        value={userDetails.fullName || 'Not provided'}
                        icon={<Person />}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <UserInfoItem
                        label="Email"
                        value={userDetails.email}
                        icon={<Person />}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <UserInfoItem
                        label="UID"
                        value={userDetails.UID}
                        highlight={true}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <UserInfoItem
                        label="Status"
                        value={getStatusChip(userDetails)}
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <UserInfoItem
                        label="Email Verified"
                        value={
                          <Chip
                            label={userDetails.isEmailVerified ? "Yes" : "No"}
                            size="small"
                            sx={{
                              bgcolor: userDetails.isEmailVerified ? `${AppColors.SUCCESS}20` : `${AppColors.ERROR}20`,
                              color: userDetails.isEmailVerified ? AppColors.SUCCESS : AppColors.ERROR,
                              fontWeight: 600,
                            }}
                          />
                        }
                      />
                    </Grid>
                    <Grid size={{ xs: 12, sm: 6 }}>
                      <UserInfoItem
                        label="2FA Enabled"
                        value={
                          <Chip
                            label={userDetails.twoFactorEnabled ? "Yes" : "No"}
                            size="small"
                            sx={{
                              bgcolor: userDetails.twoFactorEnabled ? `${AppColors.SUCCESS}20` : `${AppColors.ERROR}20`,
                              color: userDetails.twoFactorEnabled ? AppColors.SUCCESS : AppColors.ERROR,
                              fontWeight: 600,
                            }}
                          />
                        }
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Balances */}
                <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: AppColors.TXT_MAIN, fontWeight: 600, mb: { xs: 1, md: 1.5 } }}
                  >
                    Account Balance
                  </Typography>
                  <Grid container spacing={{ xs: 1, md: 1.5 }}>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Total Balance"
                        value={`$${userDetails.Balance?.toLocaleString() || '0'}`}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Winning Balance"
                        value={`$${userDetails.winningBalance?.toLocaleString() || '0'}`}
                        color={AppColors.SUCCESS}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Withdrawable"
                        value={`$${userDetails.withdrawableWinnings?.toLocaleString() || '0'}`}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Lock Balance"
                        value={`$${userDetails.lockBalance?.toLocaleString() || '0'}`}
                        color={AppColors.TXT_SUB}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Income & Trading */}
                <Box sx={{ mb: { xs: 1, md: 1.5 } }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: AppColors.TXT_MAIN, fontWeight: 600, mb: { xs: 1, md: 1.5 } }}
                  >
                    Income & Trading Statistics
                  </Typography>
                  <Grid container spacing={{ xs: 1, md: 1.5 }}>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Referral Income"
                        value={`$${userDetails.referralIncome?.toLocaleString() || '0'}`}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Level Income"
                        value={`$${userDetails.levelIncome?.toLocaleString() || '0'}`}
                        color={AppColors.SUCCESS}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Working Income"
                        value={`$${userDetails.totalWorkingIncome?.toLocaleString() || '0'}`}
                        color={AppColors.SUCCESS}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Total Deposited"
                        value={`$${userDetails.totalDeposited?.toLocaleString() || '0'}`}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Trade Volume"
                        value={`$${userDetails.totalTradedVolume?.toLocaleString() || '0'}`}
                        color={AppColors.SUCCESS}
                      />
                    </Grid>
                    <Grid size={{ xs: 6, md: 3 }}>
                      <BalanceCard
                        label="Referrals"
                        value={userDetails.referrals?.length || '0'}
                        color={AppColors.GOLD_DARK}
                      />
                    </Grid>
                  </Grid>
                </Box>

                {/* Action Buttons */}
                <Divider sx={{ my: { xs: 1, md: 1.5 }, borderColor: AppColors.BG_SECONDARY }} />
                <Box sx={{ display: 'flex', gap: { xs: 1, md: 1.5 }, flexWrap: 'wrap' }}>
                  {/* Block/Unblock Button */}
                  <Button
                    variant="outlined"
                    startIcon={userDetails.isBlocked ? <Check fontSize="small" /> : <Block fontSize="small" />}
                    onClick={() =>
                      updateUserStatus(userDetails._id, {
                        isBlocked: !userDetails.isBlocked,
                      })
                    }
                    disabled={actionLoading || userDetails.isDeleted}
                    sx={{
                      borderColor: userDetails.isBlocked ? AppColors.SUCCESS : AppColors.ERROR,
                      color: userDetails.isBlocked ? AppColors.SUCCESS : AppColors.ERROR,
                      '&:hover': {
                        borderColor: userDetails.isBlocked ? AppColors.SUCCESS : AppColors.ERROR,
                        backgroundColor: userDetails.isBlocked
                          ? `${AppColors.SUCCESS}10`
                          : `${AppColors.ERROR}10`,
                      },
                    }}
                  >
                    {userDetails.isBlocked ? 'Unblock User' : 'Block User'}
                  </Button>

                  {/* Delete/Restore Button */}
                  <Button
                    variant="outlined"
                    startIcon={userDetails.isDeleted ? <Restore fontSize="small" /> : <Delete fontSize="small" />}
                    onClick={() =>
                      updateUserStatus(userDetails._id, {
                        isDeleted: !userDetails.isDeleted,
                      })
                    }
                    disabled={actionLoading}
                    sx={{
                      borderColor: userDetails.isDeleted ? AppColors.SUCCESS : AppColors.ERROR,
                      color: userDetails.isDeleted ? AppColors.SUCCESS : AppColors.ERROR,
                      '&:hover': {
                        borderColor: userDetails.isDeleted ? AppColors.SUCCESS : AppColors.ERROR,
                        backgroundColor: userDetails.isDeleted
                          ? `${AppColors.SUCCESS}10`
                          : `${AppColors.ERROR}10`,
                      },
                    }}
                  >
                    {userDetails.isDeleted ? 'Restore User' : 'Delete User'}
                  </Button>

                  {actionLoading && (
                    <BTLoader />
                  )}
                </Box>
              </>
            ) : (
              <Box sx={{ textAlign: 'center', py: 4 }}>
                <Typography sx={{ color: AppColors.TXT_SUB }}>
                  Failed to load user details
                </Typography>
              </Box>
            )}
          </CardContent>
        </Card>
      </Modal>
    </Box>
  );
};

// User Info Item Component
const UserInfoItem = ({ label, value, icon, highlight = false }) => (
  <Box sx={{ p: { xs: 1, md: 1.5 }, backgroundColor: AppColors.BG_SECONDARY, borderRadius: 2 }}>
    <Box sx={{ display: 'flex', alignItems: 'center', gap: 1, mb: 1 }}>
      {icon && <Box sx={{ color: AppColors.GOLD_DARK }}>{icon}</Box>}
      <Typography variant="caption" sx={{ color: AppColors.TXT_SUB, textTransform: 'uppercase' }}>
        {label}
      </Typography>
    </Box>
    <Typography
      variant="body2"
      sx={{
        color: highlight ? AppColors.GOLD_DARK : AppColors.TXT_MAIN,
        fontWeight: highlight ? 600 : 400,
        fontFamily: highlight ? 'monospace' : 'inherit',
      }}
    >
      {typeof value === 'string' ? value : value}
    </Typography>
  </Box>
);

// Balance Card Component
const BalanceCard = ({ label, value, color }) => (
  <Box
    sx={{
      p: { xs: 1, md: 1.5 },
      backgroundColor: AppColors.BG_SECONDARY,
      borderRadius: 2,
      textAlign: 'center',
    }}
  >
    <Typography
      variant="h6"
      sx={{
        color: color,
        fontWeight: 700,
        mb: 0.5,
      }}
    >
      {value}
    </Typography>
    <Typography
      variant="caption"
      sx={{
        color: AppColors.TXT_SUB,
        textTransform: 'uppercase',
        letterSpacing: '0.5px',
      }}
    >
      {label}
    </Typography>
  </Box>
);

export default ManageUsers;