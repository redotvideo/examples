'use client';

import {Player} from '@revideo/player-react';
import {getGithubRepositoryInfo} from './actions';
import {useState} from 'react';
import {LoaderCircle} from 'lucide-react';
import {parseStream} from '../utils/parse';

const exampleData = [
  0, 105826000, 265664000, 265671000, 265684000, 265689000, 265694000,
  335596000, 414108000, 416767000, 425249000, 674375000, 964912000, 1177339000,
  1186686000, 1213498000, 1214781000, 1214895000, 1219921000, 1221668000,
  1222281000, 1222410000, 1222433000, 1227527000, 1228300000, 1230497000,
  1230501000, 1231234000, 1231239000, 1231314000, 1232727000, 1233520000,
  1234669000, 1236349000, 1236806000, 1237795000, 1245092000, 1251533000,
  1254263000, 1262147000, 1262899000, 1264370000, 1267519000, 1268870000,
  1271198000, 1271847000, 1274347000, 1276515000, 1276671000, 1279966000,
  1280551000, 1283338000, 1283777000, 1285088000, 1286336000, 1286728000,
  1293071000, 1293863000, 1294963000, 1295005000, 1301398000, 1303551000,
  1312541000, 1317615000, 1321096000, 1323718000, 1337789000, 1343521000,
  1344711000, 1346543000, 1371003000, 1389862000, 1494428000, 1525657000,
  1533978000, 1591597000, 1654009000, 1738062000, 1817754000, 1860276000,
  1883450000, 1883998000, 1891635000, 1930667000, 2055652000, 2201181000,
  2216214000, 2246708000, 2324529000, 2366960000, 2366996000, 2391904000,
  2479357000, 2596772000, 2601046000, 2615944000, 2637502000, 2689660000,
  2733368000, 2737046000, 2812890000, 2863564000, 2955232000, 2955857000,
  2961163000, 2983003000, 2984020000, 2987437000, 2990281000, 2996230000,
  3007072000, 3007175000, 3013062000, 3016417000, 3018616000, 3019154000,
  3026357000, 3029804000, 3036897000, 3037202000, 3037298000, 3037737000,
  3038639000, 3039016000, 3039322000, 3042145000, 3042529000, 3043490000,
  3044558000, 3046472000, 3047534000, 3048199000, 3048524000, 3048862000,
  3051935000, 3058895000, 3065009000, 3072790000, 3074109000, 3075041000,
  3079153000, 3079875000, 3080083000, 3099026000, 3099874000, 3103039000,
  3109664000, 3112885000, 3127743000, 3134934000, 3140075000, 3173641000,
  3173788000, 3176205000, 3176720000, 3178996000, 3183882000, 3184287000,
  3186716000, 3191153000, 3196320000, 3196620000, 3198638000, 3213076000,
  3234269000, 3263068000, 3270668000, 3278896000, 3284646000, 3290556000,
  3294331000, 3297742000, 3332896000, 3344044000, 3368767000, 3378844000,
  3398863000, 3434188000, 3435264000, 3435696000, 3435803000, 3442071000,
  3517995000, 3519849000, 3554474000, 3558289000, 3611948000, 3616675000,
  3618144000, 3622775000, 3635577000, 3640600000, 3669592000, 3679346000,
  3698749000, 3715355000, 3729047000, 3759434000, 3787838000, 3801028000,
  3817911000, 3878742000, 3983973000, 4006119000, 4067980000, 4087451000,
  4101992000, 4200703000, 4212009000, 4212143000, 4212882000, 4213748000,
  4213977000, 4214180000, 4214445000, 4220193000, 4220422000, 4222468000,
  4236874000, 4258899000, 4326288000, 4334389000, 4401276000, 4416803000,
  4421444000, 4437462000, 4501703000, 4556531000, 4598409000, 4690540000,
  4736772000, 4742561000, 4803793000, 4834054000, 4866127000, 4868886000,
  4873958000, 4891455000, 4921352000, 4941837000, 4953890000, 4956018000,
  4979428000, 4985123000, 5062420000, 5108308000, 5333539000, 5459835000,
  5461002000, 5521826000, 5584695000, 5586217000, 5598497000, 5604962000,
  5625413000, 5636146000, 5637453000, 5682023000, 5718405000, 5722303000,
  5760543000, 5769209000, 5772790000, 5880569000, 6110458000, 6135651000,
  6185575000, 6202790000, 6232205000, 6284650000, 6297771000, 6392835000,
  6401789000, 6480914000, 6566872000, 6643031000, 6695443000, 6696088000,
  6710689000, 6712966000, 6727715000, 6733098000, 6783253000, 6805478000,
  6875821000, 6904033000, 6971558000, 6972735000,
];

const exampleRepoName = 'redotvideo/revideo';
const exampleAvatar = 'https://avatars.githubusercontent.com/u/133898679';

function Button({
  children,
  loading,
  onClick,
}: {
  children: React.ReactNode;
  loading: boolean;
  onClick: () => void;
}) {
  return (
    <button
      className="text-sm flex items-center gap-x-2 rounded-md p-2 bg-gray-200 text-gray-700 hover:bg-gray-300"
      onClick={() => onClick()}
    >
      {loading && (
        <LoaderCircle className="animate-spin h-4 w-4 text-gray-700" />
      )}
      {children}
    </button>
  );
}

export default function Home() {
  const [repoName, setRepoName] = useState(exampleRepoName);
  const [repoImage, setRepoImage] = useState(exampleAvatar);
  const [stargazerTimes, setStargazerTimes] = useState<number[]>(exampleData);

  const [loading, setLoading] = useState(false);
  const [needsKey, setNeedsKey] = useState(false);
  const [key, setKey] = useState('');
  const [error, setError] = useState<string | null>();

  const [progress, setProgress] = useState(0);
  const [downloadUrl, setDownloadUrl] = useState<string | null>(null);

  async function fetchInformation(
    repoName: `${string}/${string}`,
    key: string,
  ) {
    setLoading(true);
    const response = await getGithubRepositoryInfo(repoName, key ?? undefined);
    setLoading(false);

    if (response.status === 'rate-limit') {
      setNeedsKey(true);
      return;
    }

    if (response.status === 'error') {
      setError('Failed to fetch repository information from Github.');
      return;
    }

    setStargazerTimes(response.stargazerTimes);
    setRepoImage(response.repoImage);
  }

  async function render() {
    console.log('Rendering');
    const res = await fetch('/api/render', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        variables: {
          data: stargazerTimes,
          repoName: repoName,
          repoImage: repoImage,
        },
        streamProgress: true,
      }),
    }).catch(e => console.log(e));
    console.log('Response', res);

    if (!res) {
      return;
    }

    const downloadUrl = await parseStream(res.body!.getReader(), p =>
      setProgress(p),
    );
    setDownloadUrl(downloadUrl);
  }

  return (
    <>
      <div className="m-auto p-12 max-w-7xl flex flex-col gap-y-4">
        <div>
          <div className="text-sm text-gray-700 mb-2">Repository</div>
          <div className="flex gap-x-4 text-sm">
            <input
              className="flex-1 rounded-md p-2 bg-gray-200 focus:outline-none placeholder:text-gray-400"
              placeholder="redotvideo/revideo"
              value={repoName}
              onChange={e => setRepoName(e.target.value)}
            />
            {!needsKey && (
              <Button
                loading={loading}
                onClick={() =>
                  fetchInformation(repoName as `${string}/${string}`, key)
                }
              >
                Fetch information
              </Button>
            )}
          </div>
        </div>
        {needsKey && (
          <div>
            <div className="text-sm text-blue-600 mb-2">
              You hit the Github API rate-limit. Please provide your own key.
              Requests to Github are made directly and the key stays on your
              device.
            </div>
            <div className="flex gap-x-4 text-sm">
              <input
                className="flex-1 rounded-md p-2 bg-gray-200 focus:outline-none placeholder:text-gray-400"
                placeholder="ghp_xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"
                value={key}
                onChange={e => setKey(e.target.value)}
              />
              <Button
                loading={loading}
                onClick={() =>
                  fetchInformation(repoName as `${string}/${string}`, key)
                }
              >
                Fetch information
              </Button>
            </div>
          </div>
        )}
        {error && <div className="text-sm text-red-600">{error}</div>}
        <div>
          <div className="rounded-lg overflow-hidden">
            {/* You can find the scene code inside revideo/src/scenes/example.tsx */}
            <Player
              src="http://localhost:4000/player/project.js"
              controls={true}
              variables={{
                data: stargazerTimes,
                repoName: repoName,
                repoImage: repoImage,
              }}
            />
          </div>
        </div>
        <div className="flex gap-x-4">
          {/* Progress bar */}
          <div className="text-sm flex-1 bg-gray-100 rounded-md overflow-hidden">
            <div
              className="text-gray-600 bg-gray-400 h-full flex items-center px-4 transition-all transition-200"
              style={{
                width: `${Math.round(progress * 100)}%`,
              }}
            >
              {Math.round(progress * 100)}%
            </div>
          </div>
          {downloadUrl ? (
            <a
              href={downloadUrl}
              download
              className="text-sm flex items-center gap-x-2 rounded-md p-2 bg-green-200 text-gray-700 hover:bg-gray-300"
            >
              Download video
            </a>
          ) : (
            <Button onClick={() => render()} loading={false}>
              Render video
            </Button>
          )}
        </div>
      </div>
    </>
  );
}
