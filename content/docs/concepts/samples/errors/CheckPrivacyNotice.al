Anthropic: Codeunit "AIOS Anthropic";
PrivacyNotice: Codeunit "AIOS Privacy Notice";
begin
    if not PrivacyNotice.IsApproved(
        Anthropic.PrivacyNoticeId(),
        Anthropic.PrivacyIntegrationName(),
        Anthropic.PrivacyLink())
    then
        Error('Ask an administrator to approve %1 on the Privacy Notices Status page.',
            Anthropic.PrivacyIntegrationName());
end;
