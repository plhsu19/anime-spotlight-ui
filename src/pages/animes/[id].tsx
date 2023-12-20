import { useRouter } from 'next/router';
import { useState } from 'react';
import { useGetAnimeContextValue } from '@/contexts/anime-context';
import { Alert, Snackbar, Button } from '@mui/material';
import animeApiService from '@/services/anime-api-service';
import type { InferGetServerSidePropsType, GetServerSideProps } from 'next';
import Layout from '@/components/layout';
import { animesPath } from '@/constants/paths';

// TODO: server-side return 404 if no anime found, currently 500 (404 from anime-api)
export const getServerSideProps = async ({ params }) => {
  const res = await animeApiService.getAnimeById(params.id);
  return {
    props: {
      anime: res.data.anime
    }
  };
};

export default function Anime(props) {
  const [editMode, setEditMode] = useState(false);
  const { state, dispatch, deleteAnime, updateAnime } =
  useGetAnimeContextValue();
  const alertIsExist = !!state.message || !!state.error;
  const [preAlertIsExist, setPreAlertIsExist] = useState(alertIsExist);
  const [alertOpen, setAlertOpen] = useState(alertIsExist);
  const router = useRouter();

  if (alertIsExist !== preAlertIsExist) {
    setAlertOpen(alertIsExist);
    setPreAlertIsExist(alertIsExist);
  }

  const handleAlertClose = (
    event?: React.SyntheticEvent | Event,
    reason?: string
  ) => {
    if (reason === 'clickaway') {
      return;
    }
    setAlertOpen(false);
  };

  return (
    <Layout page="anime">
      <h1>anime page</h1>
      <p>{router.query.id}</p>
      {router.query.edit === 'true' && (
        <p>{'query parameter edit: ' + router.query.edit}</p>
      )}
      <Snackbar
        anchorOrigin={{ vertical: 'top', horizontal: 'center' }}
        open={alertOpen}
        autoHideDuration={6000}
        onClose={handleAlertClose}
      >
        <Alert
          severity={!!state.error ? 'error' : 'success'}
          variant="filled"
          onClose={handleAlertClose}
        >
          {state.error ?? state.message}
        </Alert>
      </Snackbar>
      <h3>{props.anime.title}</h3>
      <Button
        onClick={(event) => {
          router.push(`${animesPath}/${router.query.id}`);
        }}
      >
        redirect
      </Button>
      <Button
        onClick={(event) => {
          router.push(`${animesPath}/${router.query.id}?edit=true`);
        }}
      >
        redirect to Edit
      </Button>
    </Layout>
  );
}
