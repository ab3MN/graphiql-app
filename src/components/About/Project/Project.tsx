import { Box, Typography } from '@mui/material';
import { useTranslations } from 'next-intl';
import s from './ProjectStyle';
import Content from '../Content/Content';

const Project = () => {
  const t = useTranslations('HomePage');

  const content = [
    { key: '1', text: t('project_one') },
    { key: '2', text: t('project_two') },
  ];

  return (
    <Box sx={s.container} component='article'>
      <Typography
        component='h2'
        variant='h2'
        sx={s.title}
        data-testid='project-title'
      >
        {t('projet_title')}
      </Typography>

      <Content content={content} />
    </Box>
  );
};

export default Project;