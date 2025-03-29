import { MESSAGE } from './constants/constant';

interface Data {
  message: string;
  data: any;
}

interface List {
  message?: string;
  total: number;
  limit: number;
  offset: number;
  data: any[];
}

const successCreate = (data: Data) => ({
  status: 1,
  message: data.message || MESSAGE.SUCCESS,
  data: data.data,
});

const successResponse = (data: Data) => ({
  status: 1,
  message: data.message || MESSAGE.SUCCESS,
  data: data.data,
});

const successResponseWithPagination = (data: List) => {
  const message = data.data.length
    ? MESSAGE.RECORD_FOUND('Record')
    : MESSAGE.RECORD_NOT_FOUND('Record');
  return {
    status: 1,
    message: data.message || message,
    total: data.total,
    limit: data.limit,
    offset: data.offset,
    data: data.data,
  };
};

const recordNotFound = (data: Data) => ({
  status: 0,
  message: data.message || MESSAGE.RECORD_NOT_FOUND('Record'),
  data: data.data,
});
const response = {
  successCreate,
  successResponse,
  successResponseWithPagination,
  recordNotFound,
};

export default response;
