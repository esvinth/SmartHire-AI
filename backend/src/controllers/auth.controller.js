const authService = require('../services/auth.service');
const ApiResponse = require('../utils/ApiResponse');
const asyncHandler = require('../utils/asyncHandler');

exports.register = asyncHandler(async (req, res) => {
  const { name, email, password, role } = req.body;
  const result = await authService.register({ name, email, password, role });

  res.status(201).json(
    ApiResponse.success(
      {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      'Registration successful'
    )
  );
});

exports.login = asyncHandler(async (req, res) => {
  const { email, password } = req.body;
  const result = await authService.login({ email, password });

  res.json(
    ApiResponse.success(
      {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      'Login successful'
    )
  );
});

exports.refresh = asyncHandler(async (req, res) => {
  const { refreshToken } = req.body;
  const result = await authService.refresh(refreshToken);

  res.json(
    ApiResponse.success(
      {
        user: result.user,
        accessToken: result.accessToken,
        refreshToken: result.refreshToken,
      },
      'Token refreshed'
    )
  );
});

exports.logout = asyncHandler(async (req, res) => {
  await authService.logout(req.user.id);
  res.json(ApiResponse.success(null, 'Logged out successfully'));
});

exports.me = asyncHandler(async (req, res) => {
  res.json(ApiResponse.success(req.user, 'User profile'));
});
