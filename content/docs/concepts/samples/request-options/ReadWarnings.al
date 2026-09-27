Warnings: JsonArray;
WarningToken: JsonToken;
WarningText: Text;
begin
    Result := Client.GenerateText(Model, Request);
    Warnings := Result.GetWarnings();
    foreach WarningToken in Warnings do begin
        WarningToken.WriteTo(WarningText);
        Session.LogMessage('AIOS-WARN', WarningText, Verbosity::Warning,
            DataClassification::SystemMetadata, TelemetryScope::ExtensionPublisher, 'Category', 'AI');
    end;
end;
