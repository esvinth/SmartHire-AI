const axios = require('axios');
const fs = require('fs');
const FormData = require('form-data');
const { mlServiceUrl } = require('../config/env');
const logger = require('../utils/logger');
const ApiError = require('../utils/ApiError');

class MLClientService {
  constructor() {
    this.client = axios.create({
      baseURL: mlServiceUrl,
      timeout: 30000,
    });
  }

  async extractResume(filePath) {
    try {
      const formData = new FormData();
      formData.append('file', fs.createReadStream(filePath));

      const response = await this.client.post('/api/extract', formData, {
        headers: formData.getHeaders(),
        maxContentLength: 10 * 1024 * 1024,
      });

      return response.data;
    } catch (error) {
      logger.error('ML extract error:', error.message);
      throw ApiError.internal('Failed to process resume with ML service');
    }
  }

  async analyzeResume(data) {
    try {
      const response = await this.client.post('/api/analyze', data);
      return response.data;
    } catch (error) {
      logger.error('ML analyze error:', error.message);
      throw ApiError.internal('Failed to analyze resume with ML service');
    }
  }

  async getSkills() {
    try {
      const response = await this.client.get('/api/skills');
      return response.data;
    } catch (error) {
      logger.error('ML skills error:', error.message);
      throw ApiError.internal('Failed to fetch skills from ML service');
    }
  }

  async checkHealth() {
    try {
      const response = await this.client.get('/health');
      return response.data;
    } catch (error) {
      return { status: 'error', message: error.message };
    }
  }
}

module.exports = new MLClientService();
