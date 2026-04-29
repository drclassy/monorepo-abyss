# GitHub Actions to GCP WIF Checklist

Tanggal audit: `2026-04-26`
Target project ID aktif: `abyss-monorepo`

## Ringkas

Repo ini sudah diselaraskan agar runtime `vertex-rag` membaca project GCP dari env yang konsisten.
Yang masih harus diverifikasi manual ada di konfigurasi eksternal GitHub Actions dan Google Cloud IAM.

## Best Practice Terkini

- Gunakan Workload Identity Federation untuk workload CI/CD, bukan service account key statis.
- Jika memakai service account impersonation, `workload_identity_provider`, `service_account`, dan project lineage harus konsisten.
- Untuk principal WIF, grant IAM menggunakan resource name yang fully qualified dan berbasis `project number`, bukan `project ID`.
- Batasi akses principal dengan attribute mapping / conditions; jangan grant terlalu lebar ke seluruh pool.

Referensi resmi:
- `https://cloud.google.com/iam/docs/workload-identity-federation`
- `https://cloud.google.com/iam/docs/workload-identity-federation-with-deployment-pipelines`

## Workflow yang Perlu Dicek

- `.github/workflows/gemini-review.yml`
- `.github/workflows/gemini-invoke.yml`
- `.github/workflows/gemini-plan-execute.yml`
- `.github/workflows/gemini-triage.yml`
- `.github/workflows/gemini-scheduled-triage.yml`

Semua workflow di atas membaca:

- `vars.GOOGLE_CLOUD_PROJECT`
- `vars.GOOGLE_CLOUD_LOCATION`
- `vars.SERVICE_ACCOUNT_EMAIL`
- `vars.GCP_WIF_PROVIDER`

## Checklist GitHub

Pastikan repository variables atau organization variables berikut bernilai benar:

- `GOOGLE_CLOUD_PROJECT=abyss-monorepo`
- `GOOGLE_CLOUD_LOCATION=us-central1` atau region operasional yang memang dipakai
- `SERVICE_ACCOUNT_EMAIL=<sa-name>@abyss-monorepo.iam.gserviceaccount.com`
- `GCP_WIF_PROVIDER=projects/<PROJECT_NUMBER>/locations/global/workloadIdentityPools/<POOL_ID>/providers/<PROVIDER_ID>`

Pastikan secrets berikut masih valid bila workflow memerlukannya:

- `GEMINI_API_KEY`
- `GOOGLE_API_KEY`
- `APP_PRIVATE_KEY`

## Checklist Google Cloud

Verifikasi dari Cloud Shell atau terminal yang sudah login:

```bash
gcloud config set project abyss-monorepo
gcloud iam workload-identity-pools providers describe <PROVIDER_ID> \
  --project=<PROJECT_NUMBER_HOSTING_POOL> \
  --location=global \
  --workload-identity-pool=<POOL_ID>
```

Cek bahwa:

- provider memang berada pada pool/project yang dimaksud;
- mapping `google.subject` mengarah ke claim yang benar untuk GitHub OIDC;
- ada `attribute condition` yang membatasi repo/branch/environment yang sah.

Verifikasi service account:

```bash
gcloud iam service-accounts describe <sa-name>@abyss-monorepo.iam.gserviceaccount.com
gcloud iam service-accounts get-iam-policy <sa-name>@abyss-monorepo.iam.gserviceaccount.com
```

Pastikan service account:

- memang berada di project `abyss-monorepo`;
- memiliki role yang dibutuhkan workload;
- memberi `roles/iam.workloadIdentityUser` ke principal WIF yang benar.

## Smoke Check Workflow

Setelah variables diverifikasi, jalankan satu workflow non-destruktif dan cek:

- langkah auth Google berhasil;
- tidak ada error `invalid audience`, `principalSet`, `service account not found`, atau `permission denied`;
- log workflow menunjukkan project target yang benar, bukan project lama/deleted lineage.

## Catatan

- Jangan commit `.env`; file itu local-only dan sudah diperbarui terpisah untuk development lokal.
- Jika nanti ada Artifact Registry, Secret Manager, atau service account tambahan, ulangi audit lineage yang sama terhadap `PROJECT_ID`, `PROJECT_NUMBER`, dan email SA.
