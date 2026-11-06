import { RELEASE_CHANGES } from '../config/changelog.config';

export const formatReleaseDate = (releaseDate) => {
  const parsedDate = new Date(releaseDate);
  if (Number.isNaN(parsedDate.getTime())) {
    return releaseDate;
  }

  return parsedDate.toLocaleString();
};

export const getChangesByType = (type) => (
  RELEASE_CHANGES
    .filter((change) => change.type === type)
    .sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
);

export const getAllChanges = () => (
  [...RELEASE_CHANGES].sort((a, b) => new Date(b.releaseDate) - new Date(a.releaseDate))
);
