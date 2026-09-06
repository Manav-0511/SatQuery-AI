\# SatQuery AI



Natural-language querying of satellite imagery.



\## Project



SatQuery AI explores AI systems that can answer natural-language questions about satellite imagery.



\## Current Phase



Dataset understanding and baseline experimentation.



\## Datasets



\- RSVQA

\- VRSBench

\- CDVQA

\- BigEarthNet



\## Current Experiment



RSVQA-LR zero-shot baseline.



Development subset:

\- 250 training images

\- all associated active questions and answers



\## Repository Structure



\- `data/manifests/` — dataset/sample manifests

\- `src/datasets/` — dataset loaders

\- `src/models/` — model interfaces

\- `src/inference/` — inference pipelines

\- `src/evaluation/` — evaluation metrics

\- `experiments/` — experiment configurations

\- `results/` — experiment results

\- `docs/` — research and design documentation



\## Reproducibility



Experiments should record:

\- dataset and split

\- sample manifest

\- model

\- model version/checkpoint

\- preprocessing

\- inference configuration

\- evaluation metrics

\- random seed where applicable

