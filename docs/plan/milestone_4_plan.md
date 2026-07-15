# 里程碑 4：全量同步术语重构与测试计划

## 1. 目标
解除单次 500 条的分页限制，实现术语的全量同步。

## 2. 详细设计与实现步骤

### 2.1 重构 `src/api/paratranz.js`
- 现有的 `getTerms(projectId)` 仅拉取单页：
  ```javascript
  async getTerms(projectId) {
    const res = await this._request(`/projects/${projectId}/terms?page=1&pageSize=500`);
    return res.results;
  }
  ```
- 修改为 `while` 循环分页逻辑：
  ```javascript
  async getTerms(projectId) {
    const pageSize = 500;
    const results = [];
    let page = 1;

    while (true) {
      const res = await this._request(`/projects/${projectId}/terms?page=${page}&pageSize=${pageSize}`);
      const pageResults = res.results || [];
      results.push(...pageResults);

      if (pageResults.length < pageSize) {
        break;
      }
      page += 1;
    }

    return results;
  }
  ```

### 2.2 丰富单元测试 `src/api/paratranz.test.js`
- 新增 `describe('paraTranzApi.getTerms', ...)`。
- 添加测试用例，模拟 2 页以上的术语数据拉取：
  - 第一页返回 500 条数据。
  - 第二页返回 100 条数据。
- 验证：
  - `getTerms` 返回的数据长度为 600 条。
  - `fetch` 确实被调用了 2 次。
  - 调用的参数包含正确的分页页码和单页大小（`page=1&pageSize=500` 和 `page=2&pageSize=500`）。

## 3. 验证方案
- 运行本地测试：`npm run test`。
- 打包项目：`npm run build`。
