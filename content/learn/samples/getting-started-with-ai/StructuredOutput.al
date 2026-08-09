Schema: Codeunit "AIOS Schema";
Fields: List of [JsonObject];
Request: Record "AIOS Chat Request";
begin
    Fields.Add(Schema.Field('greeting', Schema.String()));
    Request.SetPrompt('Return a short greeting');
    Request.SetOutput(Schema.Object(Fields));
    Result := Client.GenerateText(Model, Request);
    // Result.Output() is validated JSON
end;
