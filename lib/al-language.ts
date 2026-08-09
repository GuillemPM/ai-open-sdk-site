import alGrammar from '@/lib/syntax/al.tmLanguage.json';

/** Microsoft AL TextMate grammar for Shiki (docs MDX + runtime highlighting). */
// eslint-disable-next-line @typescript-eslint/no-explicit-any -- TextMate JSON is looser than Shiki LanguageRegistration
export const alLanguage: any = {
  ...alGrammar,
  name: 'al',
  displayName: 'AL',
  aliases: ['businesscentral'],
};
