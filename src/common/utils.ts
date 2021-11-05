import { Moment } from 'moment';

const getPaggingMetadata = (totalData: number, limit: number, page: number) => {
  const totalPage = Math.ceil(totalData / limit) || 1;
  let hasNextPage = false,
    nextPage,
    hasPrevPage = false,
    prevPage;
  if (page < totalPage) {
    hasNextPage = true;
    nextPage = page + 1;
  } else {
    nextPage = null;
  }
  hasPrevPage;
  if (page > 1) {
    hasPrevPage = true;
    prevPage = page - 1;
  } else {
    prevPage = null;
  }

  return {
    limit,
    totalPage,
    page,
    nextPage,
    prevPage,
    hasPrevPage,
    hasNextPage
  };
};

const wrapperMoment = (dateMomemt: Moment) =>
  dateMomemt.isValid() ? dateMomemt : null;

export { getPaggingMetadata, wrapperMoment };
