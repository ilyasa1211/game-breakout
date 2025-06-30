FROM node:24-bookworm-slim

ARG USERNAME=node

RUN corepack enable pnpm && \
  yes | pnpm -v

# Create the user
RUN apt-get update \
    && apt-get install -y sudo \
    && echo $USERNAME ALL=\(root\) NOPASSWD:ALL > /etc/sudoers.d/$USERNAME \
    && chmod 0440 /etc/sudoers.d/$USERNAME

USER $USERNAME
