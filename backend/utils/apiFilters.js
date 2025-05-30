class APIFilters {
  constructor(query, queryStr) {
    this.query = query;
    this.queryStr = queryStr;
  }

  search() {
    const keyword = this.queryStr.keyword
      ? {
        name: {
          $regex: this.queryStr.keyword,
          $options: "i",
        },
      }
      : {};

    this.query = this.query.find({ ...keyword });
    return this;
  }

  filters() {
    const queryCopy = { ...this.queryStr };

    // Fields to remove
    const fieldsToRemove = ["keyword", "page"];
    fieldsToRemove.forEach((el) => delete queryCopy[el]);

    // Advance filter for price, ratings etc
    let queryStr = JSON.stringify(queryCopy);
    queryStr = queryStr.replace(/\b(gt|gte|lt|lte)\b/g, (match) => `$${match}`);

    this.query = this.query.find(JSON.parse(queryStr));
    return this;
  }

  populate(field, options={}) {
    if (field && !options) {
      this.query = this.query.populate(field);
    }
    if(field && options){
      console.log(options)
      this.query = this.query.populate({
      path: field,
      options,
    })
    }
    return this;
  }
  nestedPopulate(field, field2) {
    if (field) {
      this.query = this.query.populate({
        path: field,
        options: { sort: { createdAt: -1 } },
        populate: {
          path: field2,
        },
      });
    }
    return this;
  }
  sort(sortBy, sortOrder) {
    this.query = this.query.sort({ [sortBy]: sortOrder })
    return this;
  }
  slice(field, option){
    this.query = this.query.slice({ [field]: option })
    return this;
  }

  pagination(resPerPage) {
    const currentPage = Number(this.queryStr.page) || 1;
    const skip = resPerPage * (currentPage - 1);

    this.query = this.query.limit(resPerPage).skip(skip);
    return this;
  }
}

export default APIFilters;
