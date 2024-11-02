class QueryBuilder {
  constructor(modelQuery, query) {
    this.modelQuery = modelQuery;
    this.query = query;
  }

  search(searchableFields = []) {
    const searchTerm = this?.query?.searchTerm;
    if (searchTerm) {
      this.modelQuery = this.modelQuery.find({
        $or: searchableFields.map((field) => ({
          [field]: { $regex: searchTerm, $options: 'i' },
        })),
      });
    }
    return this;
  }

  filter() {
    const queryObj = { ...this.query };

    const excludeFields = [
      'searchTerm',
      'sort',
      'limit',
      'page',
      'fields',
    ];
    excludeFields.forEach((el) => delete queryObj[el]);

    let queryStr = JSON.stringify(queryObj);
    queryStr = queryStr.replace(
      /\b(gte|gt|lte|lt)\b/g,
      (match) => `$${match}`,
    );

    this.modelQuery = this.modelQuery.find(JSON.parse(queryStr));
    return this;
  }

  sort() {
    const sort = this?.query?.sort?.split(',')?.join(' ') || '-createdAt';
    this.modelQuery = this.modelQuery.sort(sort);

    return this;
  }

  paginate() {
    const limit = this.query?.limit ? Number(this.query.limit) : null;

    if (limit) {
      const page = Number(this.query?.page) || 1;
      const skip = (page - 1) * limit;
      this.modelQuery = this.modelQuery.skip(skip).limit(limit);
    }

    return this;
  }

  fields() {
    const fields = this?.query?.fields?.split(',')?.join(' ') || '-__v';

    this.modelQuery = this.modelQuery.select(fields);
    return this;
  }

  async countTotal() {
    const totalQueries = this.modelQuery.getFilter();
    const total = await this.modelQuery.model.countDocuments(totalQueries);
    const page = Number(this?.query?.page) || 1;
    const limit = this?.query?.limit ? Number(this.query.limit) : total;

    const totalPage = limit > 0 ? Math.ceil(total / limit) : 1;

    return {
      page,
      limit,
      total,
      totalPage,
    };
  }
}

export default QueryBuilder;
