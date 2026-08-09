codeunit 50100 "My Echo Tool" implements "AIOS Tool"
{
    procedure Name(): Text
    begin
        exit('echo');
    end;

    procedure Description(): Text
    begin
        exit('Echoes the message argument back to the model.');
    end;

    procedure InputSchema(): JsonObject
    var
        Schema: Codeunit "AIOS Schema";
        Fields: List of [JsonObject];
    begin
        Fields.Add(Schema.Field('message', Schema.String()));
        exit(Schema.Object(Fields));
    end;

    procedure Execute(Arguments: JsonObject; var ResultText: Text): Boolean
    var
        Token: JsonToken;
    begin
        if not Arguments.Get('message', Token) then begin
            ResultText := 'echo tool requires a message argument.';
            exit(false);
        end;
        ResultText := Token.AsValue().AsText();
        exit(true);
    end;
}
