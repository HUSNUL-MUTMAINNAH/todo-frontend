const fs = require('fs');
const path = require('path');

// Read test results
const resultsPath = path.join(__dirname, '../test-results/results.json');

if (!fs.existsSync(resultsPath)) {
  console.error('❌ No test results found. Run tests first: npm run test:e2e');
  process.exit(1);
}

const results = JSON.parse(fs.readFileSync(resultsPath, 'utf8'));

// Parse results
const suites = results.suites || [];
let totalTests = 0;
let passedTests = 0;
let failedTests = 0;
let skippedTests = 0;
const testDetails = [];

function parseTests(suite, suiteName = '') {
  if (suite.specs) {
    suite.specs.forEach(spec => {
      const title = spec.title;
      const fullTitle = suiteName ? `${suiteName} › ${title}` : title;
      
      spec.tests.forEach(test => {
        totalTests++;
        const status = test.results[0]?.status || 'unknown';
        const duration = test.results[0]?.duration || 0;
        const error = test.results[0]?.error?.message || '';
        
        if (status === 'passed') passedTests++;
        else if (status === 'failed') failedTests++;
        else if (status === 'skipped') skippedTests++;
        
        testDetails.push({
          suite: suiteName,
          title: fullTitle,
          status,
          duration: Math.round(duration),
          error: error.substring(0, 200)
        });
      });
    });
  }
  
  if (suite.suites) {
    suite.suites.forEach(subSuite => {
      const newSuiteName = suiteName ? `${suiteName} › ${subSuite.title}` : subSuite.title;
      parseTests(subSuite, newSuiteName);
    });
  }
}

suites.forEach(suite => parseTests(suite));

// Generate HTML
const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Playwright E2E Test Dashboard</title>
  <style>
    * {
      margin: 0;
      padding: 0;
      box-sizing: border-box;
    }
    
    body {
      font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, Oxygen, Ubuntu, sans-serif;
      background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
      padding: 20px;
      min-height: 100vh;
    }
    
    .container {
      max-width: 1200px;
      margin: 0 auto;
    }
    
    .header {
      background: white;
      padding: 30px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }
    
    .header h1 {
      color: #333;
      margin-bottom: 10px;
    }
    
    .header p {
      color: #666;
      font-size: 14px;
    }
    
    .stats {
      display: grid;
      grid-template-columns: repeat(auto-fit, minmax(200px, 1fr));
      gap: 20px;
      margin-bottom: 20px;
    }
    
    .stat-card {
      background: white;
      padding: 25px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      text-align: center;
    }
    
    .stat-card .number {
      font-size: 48px;
      font-weight: bold;
      margin-bottom: 10px;
    }
    
    .stat-card .label {
      font-size: 14px;
      color: #666;
      text-transform: uppercase;
      letter-spacing: 1px;
    }
    
    .stat-card.total .number { color: #667eea; }
    .stat-card.passed .number { color: #48bb78; }
    .stat-card.failed .number { color: #f56565; }
    .stat-card.skipped .number { color: #ed8936; }
    
    .progress-bar {
      background: white;
      padding: 20px;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      margin-bottom: 20px;
    }
    
    .progress-bar h3 {
      margin-bottom: 15px;
      color: #333;
    }
    
    .progress {
      height: 30px;
      background: #e2e8f0;
      border-radius: 15px;
      overflow: hidden;
      display: flex;
    }
    
    .progress-segment {
      height: 100%;
      transition: width 0.3s ease;
      display: flex;
      align-items: center;
      justify-content: center;
      color: white;
      font-weight: bold;
      font-size: 12px;
    }
    
    .progress-passed { background: #48bb78; }
    .progress-failed { background: #f56565; }
    .progress-skipped { background: #ed8936; }
    
    .tests-table {
      background: white;
      border-radius: 12px;
      box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);
      overflow: hidden;
    }
    
    .tests-table h3 {
      padding: 20px;
      background: #f7fafc;
      border-bottom: 2px solid #e2e8f0;
      color: #333;
    }
    
    table {
      width: 100%;
      border-collapse: collapse;
    }
    
    th {
      background: #f7fafc;
      padding: 15px;
      text-align: left;
      font-weight: 600;
      color: #4a5568;
      font-size: 14px;
      text-transform: uppercase;
      letter-spacing: 0.5px;
    }
    
    td {
      padding: 15px;
      border-bottom: 1px solid #e2e8f0;
      color: #4a5568;
    }
    
    tr:hover {
      background: #f7fafc;
    }
    
    .status-badge {
      display: inline-block;
      padding: 5px 12px;
      border-radius: 20px;
      font-size: 12px;
      font-weight: 600;
      text-transform: uppercase;
    }
    
    .status-passed {
      background: #c6f6d5;
      color: #22543d;
    }
    
    .status-failed {
      background: #fed7d7;
      color: #742a2a;
    }
    
    .status-skipped {
      background: #feebc8;
      color: #7c2d12;
    }
    
    .duration {
      color: #718096;
      font-size: 13px;
    }
    
    .error-message {
      color: #e53e3e;
      font-size: 12px;
      font-family: monospace;
      max-width: 400px;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    
    .filter-buttons {
      padding: 20px;
      display: flex;
      gap: 10px;
      background: #f7fafc;
      border-bottom: 2px solid #e2e8f0;
    }
    
    .filter-btn {
      padding: 8px 16px;
      border: none;
      border-radius: 6px;
      cursor: pointer;
      font-weight: 600;
      font-size: 13px;
      transition: all 0.2s;
    }
    
    .filter-btn.active {
      transform: scale(1.05);
    }
    
    .filter-all { background: #667eea; color: white; }
    .filter-passed { background: #48bb78; color: white; }
    .filter-failed { background: #f56565; color: white; }
    .filter-skipped { background: #ed8936; color: white; }
    
    .timestamp {
      text-align: center;
      color: white;
      margin-top: 20px;
      font-size: 14px;
    }
  </style>
</head>
<body>
  <div class="container">
    <div class="header">
      <h1>🎭 Playwright E2E Test Dashboard</h1>
      <p>To Do List Application - Frontend Testing Results</p>
    </div>
    
    <div class="stats">
      <div class="stat-card total">
        <div class="number">${totalTests}</div>
        <div class="label">Total Tests</div>
      </div>
      <div class="stat-card passed">
        <div class="number">${passedTests}</div>
        <div class="label">Passed</div>
      </div>
      <div class="stat-card failed">
        <div class="number">${failedTests}</div>
        <div class="label">Failed</div>
      </div>
      <div class="stat-card skipped">
        <div class="number">${skippedTests}</div>
        <div class="label">Skipped</div>
      </div>
    </div>
    
    <div class="progress-bar">
      <h3>Test Results Overview</h3>
      <div class="progress">
        <div class="progress-segment progress-passed" style="width: ${(passedTests/totalTests*100).toFixed(1)}%">
          ${passedTests > 0 ? `${(passedTests/totalTests*100).toFixed(0)}%` : ''}
        </div>
        <div class="progress-segment progress-failed" style="width: ${(failedTests/totalTests*100).toFixed(1)}%">
          ${failedTests > 0 ? `${(failedTests/totalTests*100).toFixed(0)}%` : ''}
        </div>
        <div class="progress-segment progress-skipped" style="width: ${(skippedTests/totalTests*100).toFixed(1)}%">
          ${skippedTests > 0 ? `${(skippedTests/totalTests*100).toFixed(0)}%` : ''}
        </div>
      </div>
    </div>
    
    <div class="tests-table">
      <h3>Test Cases</h3>
      <div class="filter-buttons">
        <button class="filter-btn filter-all active" onclick="filterTests('all')">All (${totalTests})</button>
        <button class="filter-btn filter-passed" onclick="filterTests('passed')">Passed (${passedTests})</button>
        <button class="filter-btn filter-failed" onclick="filterTests('failed')">Failed (${failedTests})</button>
        <button class="filter-btn filter-skipped" onclick="filterTests('skipped')">Skipped (${skippedTests})</button>
      </div>
      <table>
        <thead>
          <tr>
            <th>Test Case</th>
            <th>Status</th>
            <th>Duration</th>
            <th>Error</th>
          </tr>
        </thead>
        <tbody id="test-tbody">
          ${testDetails.map(test => `
            <tr class="test-row" data-status="${test.status}">
              <td>${test.title}</td>
              <td>
                <span class="status-badge status-${test.status}">${test.status}</span>
              </td>
              <td class="duration">${test.duration}ms</td>
              <td>${test.error ? `<span class="error-message" title="${test.error}">${test.error}</span>` : '-'}</td>
            </tr>
          `).join('')}
        </tbody>
      </table>
    </div>
    
    <div class="timestamp">
      Generated on ${new Date().toLocaleString()} | Powered by Playwright
    </div>
  </div>
  
  <script>
    function filterTests(status) {
      const rows = document.querySelectorAll('.test-row');
      const buttons = document.querySelectorAll('.filter-btn');
      
      // Update button states
      buttons.forEach(btn => btn.classList.remove('active'));
      event.target.classList.add('active');
      
      // Filter rows
      rows.forEach(row => {
        if (status === 'all' || row.dataset.status === status) {
          row.style.display = '';
        } else {
          row.style.display = 'none';
        }
      });
    }
  </script>
</body>
</html>`;

// Write dashboard
const dashboardPath = path.join(__dirname, '../playwright-dashboard.html');
fs.writeFileSync(dashboardPath, html);

console.log('✅ Dashboard generated successfully!');
console.log(`📊 Total: ${totalTests} | ✓ Passed: ${passedTests} | ✗ Failed: ${failedTests} | ⊘ Skipped: ${skippedTests}`);
console.log(`📁 Dashboard saved to: ${dashboardPath}`);
console.log(`🌐 Open in browser: file://${dashboardPath.replace(/\\/g, '/')}`);
