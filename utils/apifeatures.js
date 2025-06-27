class APIFeatures {
    constructor(query, queryString) {
    this.query = query;
    this.queryString = queryString;
    }

    filter() {
    //filtering
        const queryObj = { ...this.queryString };
        const excludedFields = ['page', 'sort', 'limit', 'fields'];
        excludedFields.forEach(el => delete queryObj[el]);

        //advanced filtering using operators
        let queryStr = JSON.stringify(queryObj);
        queryStr = queryStr.replace(/\b(gte|gt|lte|lt)\b/g, match => `$${match}`);

        this.query = this.query.find(JSON.parse(queryStr))
        return this;
        }

    sort() {
        //sorting
        if(this.queryString.sort) {
            const sortBy = this.queryString.sort.split(',').join(' ')
            this.query = this.query.sort(sortBy)
        } else {
            this.query = this.query.sort('-createdAt')
        }
        return this;
    }

    limitFields() {
        //field limiting
        if(this.queryString.fields) {
            const fields = this.queryString.fields.split(',').join(' ');
            this.query = this.query.select(fields);
        } else {
            this.query = this.query.select('-__v') //excludes sending __v to the client
        }
        return this;
    }

    paginate() {
         //pagination
        const page = this.queryString.page * 1 || 1; //so by default, it is page number 1
        const limit = this.queryString.limit * 1 || 100; //so by default only 100 documents can be displayed on a page/ at once
        const skip = (page - 1) * limit;
        //page=3&limit=10, 1-10, 11-20 page 2, 21-20 page 3
        this.query = this.query.skip(skip).limit(limit);

        return this;
    }
};

module.exports = APIFeatures;