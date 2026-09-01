class APIFilters {
  constructor(model, queryStr) {
    this.model = model;
    this.queryStr = queryStr;
    this.query = model.find();
    this.searchFields = ['name'];

    // Pagination flags
    this.shouldPaginate = true;
    this.page = 1;
    this.limit = 8;

    // Store the base query for pagination count
    this.baseQuery = null;
  }

  setSearchFields(fields) {
    this.searchFields = Array.isArray(fields) ? fields : [fields];
    return this;
  }

  search() {
    if (!this.queryStr.keyword || !this.searchFields.length) return this;

    const keyword = this.queryStr.keyword.trim();
    if (!keyword) return this;

    const searchQuery = {
      $or: this.searchFields.map(field => ({
        [field]: { $regex: keyword, $options: 'i' }
      }))
    };

    this.query = this.query.find(searchQuery);
    return this;
  }

  filters() {
    const queryCopy = { ...this.queryStr };

    // Remove specific fields
    ['keyword', 'sort', 'fields', 'page', 'limit'].forEach(el => delete queryCopy[el]);

    if (Object.keys(queryCopy).length === 0) return this;

    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte|in)\b/g, match => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  disablePagination() {
    this.shouldPaginate = false;
    return this;
  }

  pagination() {
    const limit = Number(this.queryStr.limit);
    const page = Number(this.queryStr.page) || 1;

    // Agar limit 0 hai to pagination DISABLE karo
    if (limit === 0) {
      this.shouldPaginate = false;
      return this;
    }

    // Agar limit undefined/null/empty hai to default 8 rakho AND still
    // apply it, so pagination is never silently skipped.
    const finalLimit = Number.isFinite(limit) && limit > 0 ? Math.max(limit, 1) : 8;
    const finalPage = Math.max(page, 1);
    const skip = (finalPage - 1) * finalLimit;

    this.query = this.query.skip(skip).limit(finalLimit);
    this.page = finalPage;
    this.limit = finalLimit;
    this.shouldPaginate = true;

    return this;
  }

  // 🔧 FIX: skip/limit pagination in MongoDB is only stable when the sort
  // key is unique. Sorting by "-createdAt" alone means any documents that
  // share the same createdAt timestamp (very common with bulk inserts, e.g.
  // bulkRegisterStudents using insertMany) can be returned in a different
  // relative order on each request. That causes the exact symptom reported:
  // the same student shows up on page 1 AND page 2, while another student
  // silently never appears. Adding "_id" as a secondary, always-unique
  // tiebreaker makes the sort order fully deterministic across pages.
  sort() {
    if (this.queryStr.sort) {
      const requestedSort = this.queryStr.sort.split(',').join(' ');
      this.query = this.query.sort(`${requestedSort} _id`);
    } else {
      this.query = this.query.sort('-createdAt _id');
    }
    return this;
  }

  populate(populateFields) {
    if (!populateFields) return this;

    if (typeof populateFields === 'string') {
      this.query = this.query.populate(populateFields);
    } else if (Array.isArray(populateFields)) {
      populateFields.forEach(field => {
        this.query = this.query.populate(field);
      });
    } else if (typeof populateFields === 'object') {
      this.query = this.query.populate(populateFields);
    }

    return this;
  }

  async getPaginationMeta() {
    if (!this.shouldPaginate) {
      return null;
    }

    // Get the filter query WITHOUT pagination (skip/limit)
    const countQuery = this.model.find(this.query._conditions);

    // Apply the same search conditions if any
    if (this.queryStr.keyword && this.searchFields.length) {
      const keyword = this.queryStr.keyword.trim();
      const searchQuery = {
        $or: this.searchFields.map(field => ({
          [field]: { $regex: keyword, $options: 'i' }
        }))
      };
      Object.assign(countQuery._conditions, searchQuery);
    }

    const total = await countQuery.countDocuments();
    const totalPages = Math.ceil(total / this.limit);

    return {
      total,
      page: this.page,
      limit: this.limit,
      totalPages,
    };
  }
}

export default APIFilters;
