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
        search: search.trim(),
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

  // Effects
  useEffect(() => {
    fetchUsers();
  }, [page, rowsPerPage, search, statusFilter, sortBy, sortOrder]);

  return (
    <Box>
      {/* Header */}
      <Box sx={{ mb: { xs: 2, md: 3 } }}>
        <Typography
          variant="h4"
          sx={{
            fontWeight: 700,
            color: AppColors.TXT_MAIN,
            mb: 1,
            background: `linear-gradient(45deg, ${AppColors.GOLD_DARK}, ${AppColors.GOLD_LIGHT})`,
            backgroundClip: 'text',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Manage Users
        </Typography>
        <Typography
          variant="body1"
          sx={{
            color: AppColors.TXT_SUB,
            fontWeight: 400
          }}
        >
          Comprehensive user management and analytics dashboard
        </Typography>
      </Box>

      {/* Filters and Search */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: AppColors.BG_CARD,
          border: `1px solid ${AppColors.BG_SECONDARY}`,
          borderRadius: 3,
          p: { xs: 2, md: 3 },
          mb: { xs: 2, md: 3 },
        }}
      >
        <Grid container spacing={2} alignItems="center">
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

          {/* Sort By */}
          <Grid size={{ xs: 12, sm: 6, md: 3 }}>
            <FormControl fullWidth size="small">
              <InputLabel sx={{ color: AppColors.TXT_SUB }}>Sort By</InputLabel>
              <Select
                value={sortBy}
                onChange={(e) => setSortBy(e.target.value)}
                label="Sort By"
                sx={{
                  backgroundColor: AppColors.BG_SECONDARY,
                  '& .MuiOutlinedInput-notchedOutline': { border: 'none' },
                  '& .MuiSelect-select': { color: AppColors.TXT_MAIN },
                }}
              >
                <MenuItem value="createdAt">Created Date</MenuItem>
                <MenuItem value="email">Email</MenuItem>
                <MenuItem value="fullName">Name</MenuItem>
                <MenuItem value="UID">UID</MenuItem>
              </Select>
            </FormControl>
          </Grid>

          {/* Sort Order */}
          <Grid size={{ xs: 12, md: 2 }}>
            <Button
              fullWidth
              variant="outlined"
              onClick={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
              startIcon={<Sort />}
              sx={{
                borderColor: AppColors.GOLD_DARK,
                color: AppColors.GOLD_DARK,
                '&:hover': {
                  borderColor: AppColors.GOLD_DARK,
                  backgroundColor: `${AppColors.GOLD_DARK}10`,
                },
              }}
            >
              {sortOrder === 'asc' ? 'A-Z' : 'Z-A'}
            </Button>
          </Grid>
        </Grid>
      </Paper>

      {/* Users Table */}
      <Paper
        elevation={0}
        sx={{
          backgroundColor: AppColors.BG_CARD,
          border: `1px solid ${AppColors.BG_SECONDARY}`,
          borderRadius: 3,
          overflow: 'hidden',
        }}
      >
        <TableContainer>
          <Table>
            <TableHead>
              <TableRow sx={{ backgroundColor: AppColors.BG_SECONDARY }}>
                <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
                  User
                </TableCell>
                <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
                  UID
                </TableCell>
                <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
                  Status
                </TableCell>
                <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }}>
                  Created
                </TableCell>
                <TableCell sx={{ color: AppColors.TXT_MAIN, fontWeight: 600 }} align="center">
                  Actions
                </TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {loading ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4 }}>
                    <BTLoader />
                  </TableCell>
                </TableRow>
              ) : users.length === 0 ? (
                <TableRow>
                  <TableCell colSpan={5} align="center" sx={{ py: 4, color: AppColors.TXT_SUB }}>
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
                            width: 40,
                            height: 40,
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
                          <Typography
                            variant="caption"
                            sx={{ color: AppColors.TXT_SUB }}
                          >
                            {user.email}
                          </Typography>
                        </Box>
                      </Box>
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
      </Paper>

      {/* User Details Modal */}
      <Modal
        open={modalOpen}
        onClose={handleModalClose}
        sx={{
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          p: 2,
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
          <CardContent sx={{ p: { xs: 2, md: 3 } }}>
            {/* Modal Header */}
            <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
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
              <Box sx={{ display: 'flex', justifyContent: 'center', py: 4 }}>
                <BTLoader />
              </Box>
            ) : userDetails ? (
              <>
                {/* User Info */}
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: AppColors.TXT_MAIN, fontWeight: 600, mb: 2 }}
                  >
                    Basic Information
                  </Typography>
                  <Grid container spacing={2}>
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
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: AppColors.TXT_MAIN, fontWeight: 600, mb: 2 }}
                  >
                    Account Balance
                  </Typography>
                  <Grid container spacing={2}>
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
                <Box sx={{ mb: 3 }}>
                  <Typography
                    variant="subtitle1"
                    sx={{ color: AppColors.TXT_MAIN, fontWeight: 600, mb: 2 }}
                  >
                    Income & Trading Statistics
                  </Typography>
                  <Grid container spacing={2}>
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
                <Divider sx={{ my: 3, borderColor: AppColors.BG_SECONDARY }} />
                <Box sx={{ display: 'flex', gap: 2, flexWrap: 'wrap' }}>
                  {/* Block/Unblock Button */}
                  <Button
                    variant="outlined"
                    startIcon={userDetails.isBlocked ? <Check /> : <Block />}
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
                    startIcon={userDetails.isDeleted ? <Restore /> : <Delete />}
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
  <Box sx={{ p: 2, backgroundColor: AppColors.BG_SECONDARY, borderRadius: 2 }}>
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
      p: 2,
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